package com.secureambulance

import android.content.ContentValues
import android.media.MediaScannerConnection
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.widget.Toast
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.location.LocationManager
import android.provider.Settings
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.LocationSettingsRequest
import com.google.android.gms.location.Priority
import java.io.File
import java.io.FileOutputStream

class DownloadModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pendingLocationPromise: Promise? = null
    private val REQUEST_CHECK_SETTINGS = 9988

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "DownloadModule"

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CHECK_SETTINGS) {
            val promise = pendingLocationPromise
            pendingLocationPromise = null
            if (resultCode == Activity.RESULT_OK) {
                promise?.resolve(true)
            } else {
                promise?.resolve(false)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        // No-op
    }

    @ReactMethod
    fun isLocationEnabled(promise: Promise) {
        try {
            val locationManager = reactContext.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            if (locationManager == null) {
                promise.resolve(false)
                return
            }
            val isEnabled = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                locationManager.isLocationEnabled
            } else {
                val isGps = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
                val isNetwork = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
                isGps || isNetwork
            }
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openLocationSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                val intent = Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject("ERROR", ex.localizedMessage, ex)
            }
        }
    }

    @ReactMethod
    fun promptEnableLocation(promise: Promise) {
        try {
            val activity = reactContext.currentActivity
            if (activity == null) {
                openLocationSettings(promise)
                return
            }

            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000L).build()
            val builder = LocationSettingsRequest.Builder()
                .addLocationRequest(locationRequest)
                .setAlwaysShow(true)

            val client = LocationServices.getSettingsClient(activity)
            val task = client.checkLocationSettings(builder.build())

            task.addOnSuccessListener {
                promise.resolve(true)
            }

            task.addOnFailureListener { exception ->
                if (exception is ResolvableApiException) {
                    try {
                        pendingLocationPromise?.resolve(false)
                        pendingLocationPromise = promise
                        exception.startResolutionForResult(activity, REQUEST_CHECK_SETTINGS)
                    } catch (sendEx: Exception) {
                        pendingLocationPromise = null
                        promise.resolve(false)
                    }
                } else {
                    // Cannot show in-app resolution, fallback to opening location settings
                    openLocationSettings(promise)
                }
            }
        } catch (e: Exception) {
            openLocationSettings(promise)
        }
    }

    @ReactMethod
    fun downloadFile(
        base64Data: String,
        fileName: String,
        mimeType: String,
        promise: Promise
    ) {
        try {
            val bytes = Base64.decode(base64Data, Base64.DEFAULT)
            var success = false
            var targetPath = ""

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                try {
                    val resolver = reactContext.contentResolver
                    val contentValues = ContentValues().apply {
                        put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                        put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    }
                    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                    if (uri != null) {
                        resolver.openOutputStream(uri)?.use { stream ->
                            stream.write(bytes)
                            stream.flush()
                        }
                        targetPath = uri.toString()
                        success = true
                    }
                } catch (mediaEx: Exception) {
                    mediaEx.printStackTrace()
                }
            }

            // Fallback for API < 29 or when MediaStore insertion fails
            if (!success) {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs()
                }
                val targetFile = File(downloadsDir, fileName)
                FileOutputStream(targetFile).use { stream ->
                    stream.write(bytes)
                    stream.flush()
                }
                targetPath = targetFile.absolutePath

                try {
                    MediaScannerConnection.scanFile(
                        reactContext,
                        arrayOf(targetFile.absolutePath),
                        arrayOf(mimeType),
                        null
                    )
                } catch (scanEx: Exception) {
                    scanEx.printStackTrace()
                }

                success = true
            }

            if (success) {
                reactContext.runOnUiQueueThread {
                    Toast.makeText(
                        reactContext,
                        "Saved $fileName to Downloads",
                        Toast.LENGTH_LONG
                    ).show()
                }
                promise.resolve(targetPath)
            } else {
                promise.reject("DOWNLOAD_FAILED", "Failed to save file to Downloads")
            }
        } catch (e: Exception) {
            promise.reject("DOWNLOAD_ERROR", e.localizedMessage ?: "Unknown download error", e)
        }
    }
}
