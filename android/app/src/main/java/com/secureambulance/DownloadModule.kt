package com.secureambulance

import android.content.ContentValues
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.widget.Toast
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream

class DownloadModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DownloadModule"

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
            } else {
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
                success = true
            }

            if (success) {
                reactContext.runOnUiQueueThread {
                    Toast.makeText(
                        reactContext,
                        "Downloaded $fileName to Downloads folder",
                        Toast.LENGTH_LONG
                    ).show()
                }
                promise.resolve(targetPath)
            } else {
                promise.reject("DOWNLOAD_FAILED", "Failed to save file to Downloads")
            }
        } catch (e: Exception) {
            promise.reject("DOWNLOAD_ERROR", e.localizedMessage, e)
        }
    }
}
