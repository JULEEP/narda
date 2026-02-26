const admin = require("../config/firebase");

/**
 * Send push notification to multiple FCM tokens
 * @param {Array} fcmTokens - array of device tokens
 * @param {string} title - notification title
 * @param {string} body - notification body
 * @param {Object} data - optional custom data
 */
const sendPushNotification = async (fcmTokens, title, body, data = {}) => {
  if (!fcmTokens || fcmTokens.length === 0) {
    console.log("❌ No FCM tokens provided for push notification");
    return null;
  }

  try {
    // -------------------------------
    // Option 1: sendEachForMulticast (old Firebase)
    // -------------------------------
    if (admin.messaging().sendEachForMulticast) {
      const baseMessage = {
        notification: { title, body },
        data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "high_priority_channel", // MUST MATCH ANDROID CHANNEL
            visibility: "public",
            notificationPriority: "PRIORITY_HIGH",
          },
        },
       apns: {
  headers: {
    "apns-priority": "10",
    "apns-push-type": "alert" // :white_check_mark: REQUIRED by Apple (iOS 13+)
  },
  payload: {
    aps: {
      alert: {
        title: title,
        body: body,
      },
      sound: "default",
      badge: 1,
    },
  },
},
      };

      const messages = fcmTokens.map(token => ({
        ...baseMessage,
        token,
      }));

      const response = await admin.messaging().sendEach(messages);

      console.log(
        "📤 Notification sent via sendEach:",
        response.successCount,
        "success,",
        response.failureCount,
        "failed"
      );
      console.log("📦 Detailed Response:", response.responses);

      return response;
    }

    // -------------------------------
    // Option 2: sendMulticast (new Firebase)
    // -------------------------------
    else if (admin.messaging().sendMulticast) {
      const message = {
        notification: { title, body },
        data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "high_priority_channel",
            visibility: "public",
            notificationPriority: "PRIORITY_HIGH",
          },
        },
       apns: {
  headers: {
    "apns-priority": "10",
    "apns-push-type": "alert" // :white_check_mark: REQUIRED by Apple (iOS 13+)
  },
  payload: {
    aps: {
      alert: {
        title: title,
        body: body,
      },
      sound: "default",
      badge: 1,
    },
  },
},
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendMulticast(message);

      console.log(
        "📤 Notification sent via sendMulticast:",
        response.successCount,
        "success,",
        response.failureCount,
        "failed"
      );
      console.log("📦 Detailed Response:", response.responses);

      return response;
    }

    // -------------------------------
    // Option 3: Fallback - send individually
    // -------------------------------
    else {
      console.log("⚠️ Fallback: Sending notifications individually");

      const responses = [];
      let successCount = 0;
      let failureCount = 0;

      for (const token of fcmTokens) {
        try {
          const message = {
            notification: { title, body },
            data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
            token,
            android: {
              priority: "high",
              notification: {
                sound: "default",
                channelId: "high_priority_channel",
                visibility: "public",
                notificationPriority: "PRIORITY_HIGH",
              },
            },
           apns: {
  headers: {
    "apns-priority": "10",
    "apns-push-type": "alert" // :white_check_mark: REQUIRED by Apple (iOS 13+)
  },
  payload: {
    aps: {
      alert: {
        title: title,
        body: body,
      },
      sound: "default",
      badge: 1,
    },
  },
},
          };

          const response = await admin.messaging().send(message);
          successCount++;
          responses.push({ success: true, token, messageId: response });
          console.log(`✅ Sent to token: ${token.substring(0, 30)}...`);
        } catch (error) {
          failureCount++;
          responses.push({ success: false, token, error: error.message });
          console.error(
            `❌ Failed for token ${token.substring(0, 30)}...:`,
            error.message
          );

          // Remove invalid tokens from DB if needed
          if (
            error.code === "messaging/registration-token-not-registered" ||
            error.code === "messaging/invalid-argument"
          ) {
            console.log(`🗑️ Removing invalid token: ${token.substring(0, 30)}...`);
          }
        }
      }

      const result = { successCount, failureCount, responses, total: fcmTokens.length };
      console.log(
        "📤 Notification sent via individual sends:",
        successCount,
        "success,",
        failureCount,
        "failed"
      );
      console.log("📦 Detailed Responses:", responses);

      return result;
    }
  } catch (error) {
    console.error("🔥 Error sending notification:", error);
    throw error;
  }
};

module.exports = sendPushNotification;
