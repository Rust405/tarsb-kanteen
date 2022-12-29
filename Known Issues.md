1. Right sidebar swipeable edge does not work with mouse pointer. (Ignored, unlikely to be a problem)

2. Stall Register Code is hardcoded string. (Ignored, time constraint. Implementation and security can be improved at the expense of performance)

3. Each staff and owner can only be associated with one stall, checked by email. (Ignored, can be "bypassed" by using multiple Google accounts but no requirement for a stall-switching interface)

4. Authenticating with `--token` is deprecated and will be removed in a future major version of `firebase-tools`. Instead, use a service account key with `GOOGLE_APPLICATION_CREDENTIALS`: https://cloud.google.com/docs/authentication/getting-started. (Ignored, can't find any official documentation on how to update this and the deprecation was very recent).

5. Profile image may return 403 when running locally on http://localhost. This does not happen if 127.0.0.1 is used instead. (Solved, create a .env.local file in root and add HOST=127.0.0.1 so that every npm start run uses 127.0.0.1)

6. Modify and Update order feature dropped. (Time constraint).

7. Fixed (unmodifiable) stall operational hours. (Time constraint).

8. When a menu item is made unavailable, it is not removed from existing orders. (Ignored, although useful it will take longer to implement, orders can still be manually cancelled by stall users and menu items are removed from order creation automatically.)

9. estWaitTime doesn't update if order in queue is cancelled. (Ignored, estWaitTime is worst case scenario so acceptable.)

10. Fixed 10 minutes pre-order reminder (Unable to implement custom timings within deadline.)

11. Unlikely case, if pre-order is completed before pickup timestamp, then reminder is not deleted (Ignored, unlikely case to occur, minimal impact on experience.)

12. Currently no code to remove stale/unregistered FCM tokens.