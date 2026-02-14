package com.solanasaga.app;

import androidx.appcompat.app.AppCompatActivity;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    private static final String APP_URL = "https://www.solanasaga.fun?psg1=true";

    private WebView webView;
    private ProgressBar progressBar;
    private FrameLayout splashScreen;
    private WalletBridge walletBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Fullscreen immersive (NoActionBar handled by theme)
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        // Dark status/nav bar
        getWindow().setStatusBarColor(Color.parseColor("#050505"));
        getWindow().setNavigationBarColor(Color.parseColor("#050505"));

        // Keep screen on while app is active
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Create layout
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#050505"));

        // WebView
        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#050505"));
        root.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // Splash / Loading overlay
        splashScreen = new FrameLayout(this);
        splashScreen.setBackgroundColor(Color.parseColor("#050505"));

        TextView loadingText = new TextView(this);
        loadingText.setText("SOLANA SAGA");
        loadingText.setTextColor(Color.parseColor("#00F3FF"));
        loadingText.setTextSize(32);
        loadingText.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        loadingText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        FrameLayout.LayoutParams textParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        );
        textParams.gravity = android.view.Gravity.CENTER;
        splashScreen.addView(loadingText, textParams);

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setIndeterminate(false);
        progressBar.setMax(100);
        progressBar.setProgress(0);
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(
            600, 8
        );
        progressParams.gravity = android.view.Gravity.CENTER_HORIZONTAL | android.view.Gravity.BOTTOM;
        progressParams.bottomMargin = 200;
        splashScreen.addView(progressBar, progressParams);

        root.addView(splashScreen, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        setContentView(root);

        // Configure WebView
        setupWebView();

        // Register SMWA wallet bridge for native wallet connections
        walletBridge = new WalletBridge(this, webView);
        webView.addJavascriptInterface(walletBridge, "SolanaBridge");

        // Load the app
        webView.loadUrl(APP_URL);

        // Safety timeout - hide splash after 5 seconds no matter what
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (splashScreen.getVisibility() == View.VISIBLE) {
                splashScreen.animate()
                    .alpha(0f)
                    .setDuration(300)
                    .withEndAction(() -> splashScreen.setVisibility(View.GONE))
                    .start();
            }
        }, 5000);
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // Essential for PWA
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // Allow mixed content for local dev
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Performance
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Viewport
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        // User agent - add PSG1 identifier
        String ua = settings.getUserAgentString();
        settings.setUserAgentString(ua + " SolanaSagaPWA/1.0 PSG1");

        // WebView client - keep navigation in-app
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                android.util.Log.d("SolanaSaga", "shouldOverrideUrlLoading: " + url);

                // Allow wallet deep links to open external apps
                // Supports: Solana MWA, Phantom, Solflare, Jupiter Mobile, WalletConnect
                if (url.startsWith("solana-wallet:") ||
                    url.startsWith("phantom:") ||
                    url.startsWith("solflare:") ||
                    url.startsWith("jupiter:") ||
                    url.startsWith("wc:") ||
                    url.startsWith("intent:")) {
                    try {
                        android.content.Intent intent;
                        if (url.startsWith("intent:")) {
                            intent = android.content.Intent.parseUri(url, android.content.Intent.URI_INTENT_SCHEME);
                        } else {
                            intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url));
                        }
                        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                        // Try to launch directly - don't check resolveActivity
                        // as Android 11+ may not resolve even with <queries>
                        startActivity(intent);
                        android.util.Log.d("SolanaSaga", "Launched wallet intent: " + url.substring(0, Math.min(url.length(), 50)));
                    } catch (android.content.ActivityNotFoundException e) {
                        android.util.Log.w("SolanaSaga", "No app to handle: " + url);
                        // If no wallet app found, try to open Play Store for the wallet
                        try {
                            String storeUrl = null;
                            if (url.startsWith("phantom:")) {
                                storeUrl = "https://play.google.com/store/apps/details?id=app.phantom";
                            } else if (url.startsWith("jupiter:")) {
                                storeUrl = "https://play.google.com/store/apps/details?id=ag.jup.jupiter.android";
                            } else if (url.startsWith("solflare:")) {
                                storeUrl = "https://play.google.com/store/apps/details?id=com.solflare.mobile";
                            } else if (url.startsWith("solana-wallet:")) {
                                // MWA protocol - try Phantom as default MWA handler
                                storeUrl = "https://play.google.com/store/apps/details?id=app.phantom";
                            }
                            if (storeUrl != null) {
                                android.content.Intent storeIntent = new android.content.Intent(
                                    android.content.Intent.ACTION_VIEW,
                                    android.net.Uri.parse(storeUrl)
                                );
                                startActivity(storeIntent);
                            }
                        } catch (Exception e2) {
                            android.util.Log.e("SolanaSaga", "Failed to open store: " + e2.getMessage());
                        }
                    } catch (Exception e) {
                        android.util.Log.e("SolanaSaga", "Failed to open wallet: " + e.getMessage());
                    }
                    return true;
                }

                // Keep same-origin and wallet-related navigation in WebView
                if (url.contains("vercel.app") ||
                    url.contains("localhost") ||
                    url.contains("192.168.") ||
                    url.contains("jup.ag") ||
                    url.contains("walletconnect.com") ||
                    url.contains("walletconnect.org") ||
                    url.contains("reown.com") ||
                    url.contains("bridge.walletconnect.org")) {
                    return false;
                }
                // Open external links in browser
                try {
                    android.content.Intent browserIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url));
                    startActivity(browserIntent);
                } catch (Exception e) {
                    android.util.Log.e("SolanaSaga", "Failed to open browser: " + e.getMessage());
                }
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                android.util.Log.d("SolanaSaga", "onPageStarted: " + url);
                if (splashScreen.getVisibility() == View.VISIBLE) {
                    progressBar.setProgress(10);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                android.util.Log.d("SolanaSaga", "onPageFinished: " + url);
                // Hide splash after page loads
                splashScreen.animate()
                    .alpha(0f)
                    .setDuration(500)
                    .withEndAction(() -> splashScreen.setVisibility(View.GONE))
                    .start();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                android.util.Log.e("SolanaSaga", "onReceivedError: " + error.getDescription() + " url=" + request.getUrl());
                super.onReceivedError(view, request, error);
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                android.util.Log.e("SolanaSaga", "onReceivedHttpError: " + response.getStatusCode() + " url=" + request.getUrl());
                super.onReceivedHttpError(view, request, response);
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                android.util.Log.e("SolanaSaga", "onReceivedSslError: " + error.toString());
                super.onReceivedSslError(view, handler, error);
            }
        });

        // Chrome client for progress and console
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (splashScreen.getVisibility() == View.VISIBLE) {
                    progressBar.setProgress(newProgress);
                }
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                // Forward to logcat for debugging
                android.util.Log.d("SolanaSaga", consoleMessage.message()
                    + " -- " + consoleMessage.sourceId()
                    + ":" + consoleMessage.lineNumber());
                return true;
            }
        });

        // Enable remote debugging
        WebView.setWebContentsDebuggingEnabled(true);
    }

    // Forward gamepad/key events to WebView as keyboard events
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (isGamepadDevice(event)) {
            // Let the WebView's Gamepad API handle it natively
            return super.onKeyDown(keyCode, event);
        }
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (webView.canGoBack()) {
                webView.goBack();
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (isGamepadDevice(event)) {
            return super.onKeyUp(keyCode, event);
        }
        return super.onKeyUp(keyCode, event);
    }

    private boolean isGamepadDevice(KeyEvent event) {
        return (event.getSource() & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD
            || (event.getSource() & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK;
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
        // Re-enter immersive mode
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );
    }

    @Override
    protected void onPause() {
        webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        webView.destroy();
        super.onDestroy();
    }
}
