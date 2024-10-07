package com.techxelo.dairyapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.notifications.notifications.LocalNotifications;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Local Notifications
        LocalNotifications.initialize(this);
    }
}
