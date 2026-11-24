#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

// iOS counterpart of android/.../DownloadModule.kt.
// iOS has no shared Downloads folder: the file is written to the app's Documents
// directory (visible in Files > On My iPhone > SecureAmbulance) and the share sheet
// is presented so the user can "Save to Files", AirDrop, mail, etc.
@interface DownloadModule : NSObject <RCTBridgeModule>
@end

@implementation DownloadModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_METHOD(downloadFile:(NSString *)base64Data
                  fileName:(NSString *)fileName
                  mimeType:(NSString *)mimeType
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64Data
                                                     options:NSDataBase64DecodingIgnoreUnknownCharacters];
  if (data == nil) {
    reject(@"E_DECODE", @"Could not decode file data", nil);
    return;
  }

  NSURL *documentsDir = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory
                                                                inDomains:NSUserDomainMask] firstObject];
  NSURL *fileURL = [documentsDir URLByAppendingPathComponent:fileName];

  NSError *writeError = nil;
  if (![data writeToURL:fileURL options:NSDataWritingAtomic error:&writeError]) {
    reject(@"E_WRITE", writeError.localizedDescription ?: @"Could not save file", writeError);
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *presenter = RCTPresentedViewController();
    if (presenter == nil) {
      // File is saved even if the share sheet cannot be shown.
      resolve(@{ @"path" : fileURL.path, @"shared" : @NO });
      return;
    }

    UIActivityViewController *activityVC =
        [[UIActivityViewController alloc] initWithActivityItems:@[ fileURL ] applicationActivities:nil];

    // Required on iPad, otherwise presenting the share sheet crashes.
    UIPopoverPresentationController *popover = activityVC.popoverPresentationController;
    if (popover != nil) {
      popover.sourceView = presenter.view;
      popover.sourceRect = CGRectMake(CGRectGetMidX(presenter.view.bounds), CGRectGetMidY(presenter.view.bounds), 0, 0);
      popover.permittedArrowDirections = 0;
    }

    activityVC.completionWithItemsHandler = ^(UIActivityType activityType, BOOL completed, NSArray *returnedItems, NSError *activityError) {
      resolve(@{ @"path" : fileURL.path, @"shared" : @(completed) });
    };

    [presenter presentViewController:activityVC animated:YES completion:nil];
  });
}

@end
