package com.solanasaga.app

import android.net.Uri
import android.util.Base64
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.solana.mobilewalletadapter.clientlib.ActivityResultSender
import com.solana.mobilewalletadapter.clientlib.ConnectionIdentity
import com.solana.mobilewalletadapter.clientlib.MobileWalletAdapter
import com.solana.mobilewalletadapter.clientlib.Solana
import com.solana.mobilewalletadapter.clientlib.TransactionResult
import kotlinx.coroutines.launch
import org.json.JSONArray

class WalletBridge(
    private val activity: AppCompatActivity,
    private val webView: WebView
) {
    companion object {
        private const val TAG = "WalletBridge"
        private val IDENTITY_URI = Uri.parse("https://frontend-alpha-khaki.vercel.app")
        private val ICON_URI = Uri.parse("favicon.ico")
        private const val IDENTITY_NAME = "Solana Saga"
        private val BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".toCharArray()
    }

    private val mwa = MobileWalletAdapter(
        connectionIdentity = ConnectionIdentity(
            identityUri = IDENTITY_URI,
            iconUri = ICON_URI,
            identityName = IDENTITY_NAME
        )
    ).apply {
        blockchain = Solana.Mainnet
    }

    private val sender = ActivityResultSender(activity)

    private var publicKeyBytes: ByteArray? = null
    private var publicKeyBase58: String? = null

    @JavascriptInterface
    fun isAvailable(): Boolean = true

    @JavascriptInterface
    fun getPublicKey(): String? = publicKeyBase58

    @JavascriptInterface
    fun connect(callbackId: String) {
        Log.d(TAG, "connect called, callbackId=$callbackId")
        activity.lifecycleScope.launch {
            try {
                val result = mwa.transact(sender) { authResult ->
                    val pubkey = authResult.accounts.first().publicKey
                    pubkey
                }

                when (result) {
                    is TransactionResult.Success -> {
                        publicKeyBytes = result.payload
                        publicKeyBase58 = encodeBase58(result.payload)

                        Log.d(TAG, "Connected: $publicKeyBase58")
                        val jsResult = "{\"publicKey\":\"$publicKeyBase58\"}"
                        evaluateJs("window.__smwaResolve('$callbackId', $jsResult)")
                    }
                    is TransactionResult.NoWalletFound -> {
                        Log.e(TAG, "No MWA wallet found")
                        evaluateJs("window.__smwaReject('$callbackId', 'No compatible wallet found. Please install Jupiter Mobile.')")
                    }
                    is TransactionResult.Failure -> {
                        Log.e(TAG, "connect failed: ${result.message}", result.e)
                        val msg = escapeJs(result.message)
                        evaluateJs("window.__smwaReject('$callbackId', '$msg')")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "connect failed", e)
                val msg = escapeJs(e.message ?: "Connection failed")
                evaluateJs("window.__smwaReject('$callbackId', '$msg')")
            }
        }
    }

    @JavascriptInterface
    fun disconnect(callbackId: String) {
        Log.d(TAG, "disconnect called, callbackId=$callbackId")
        activity.lifecycleScope.launch {
            try {
                mwa.disconnect(sender)
                publicKeyBytes = null
                publicKeyBase58 = null

                Log.d(TAG, "Disconnected")
                evaluateJs("window.__smwaResolve('$callbackId', {})")
            } catch (e: Exception) {
                Log.e(TAG, "disconnect failed", e)
                publicKeyBytes = null
                publicKeyBase58 = null
                val msg = escapeJs(e.message ?: "Disconnect failed")
                evaluateJs("window.__smwaReject('$callbackId', '$msg')")
            }
        }
    }

    @JavascriptInterface
    fun signTransactions(callbackId: String, base64TxsJson: String) {
        Log.d(TAG, "signTransactions called, callbackId=$callbackId")
        activity.lifecycleScope.launch {
            try {
                val txBytesArray = parseBase64JsonArray(base64TxsJson)

                val result = mwa.transact(sender) { authResult ->
                    val signResult = signTransactions(txBytesArray)
                    signResult.signedPayloads
                }

                when (result) {
                    is TransactionResult.Success -> {
                        val signedArray = JSONArray()
                        for (signedTx in result.payload) {
                            signedArray.put(Base64.encodeToString(signedTx, Base64.NO_WRAP))
                        }
                        Log.d(TAG, "Signed ${signedArray.length()} transactions")
                        evaluateJs("window.__smwaResolve('$callbackId', ${signedArray})")
                    }
                    is TransactionResult.NoWalletFound -> {
                        evaluateJs("window.__smwaReject('$callbackId', 'No compatible wallet found')")
                    }
                    is TransactionResult.Failure -> {
                        val msg = escapeJs(result.message)
                        evaluateJs("window.__smwaReject('$callbackId', '$msg')")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "signTransactions failed", e)
                val msg = escapeJs(e.message ?: "Sign failed")
                evaluateJs("window.__smwaReject('$callbackId', '$msg')")
            }
        }
    }

    @JavascriptInterface
    fun signAndSendTransactions(callbackId: String, base64TxsJson: String) {
        Log.d(TAG, "signAndSendTransactions called, callbackId=$callbackId")
        activity.lifecycleScope.launch {
            try {
                val txBytesArray = parseBase64JsonArray(base64TxsJson)

                val result = mwa.transact(sender) { authResult ->
                    val sendResult = signAndSendTransactions(txBytesArray)
                    sendResult.signatures
                }

                when (result) {
                    is TransactionResult.Success -> {
                        val signaturesArray = JSONArray()
                        for (sig in result.payload) {
                            signaturesArray.put(Base64.encodeToString(sig, Base64.NO_WRAP))
                        }
                        Log.d(TAG, "Signed and sent ${signaturesArray.length()} transactions")
                        evaluateJs("window.__smwaResolve('$callbackId', ${signaturesArray})")
                    }
                    is TransactionResult.NoWalletFound -> {
                        evaluateJs("window.__smwaReject('$callbackId', 'No compatible wallet found')")
                    }
                    is TransactionResult.Failure -> {
                        val msg = escapeJs(result.message)
                        evaluateJs("window.__smwaReject('$callbackId', '$msg')")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "signAndSendTransactions failed", e)
                val msg = escapeJs(e.message ?: "Sign and send failed")
                evaluateJs("window.__smwaReject('$callbackId', '$msg')")
            }
        }
    }

    private fun parseBase64JsonArray(json: String): Array<ByteArray> {
        val arr = JSONArray(json)
        return Array(arr.length()) { i ->
            Base64.decode(arr.getString(i), Base64.DEFAULT)
        }
    }

    private fun evaluateJs(script: String) {
        activity.runOnUiThread {
            webView.evaluateJavascript(script, null)
        }
    }

    private fun escapeJs(s: String): String {
        return s.replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
    }

    private fun encodeBase58(input: ByteArray): String {
        if (input.isEmpty()) return ""

        var leadingZeros = 0
        for (b in input) {
            if (b.toInt() == 0) leadingZeros++ else break
        }

        val encoded = mutableListOf<Char>()
        var num = input.map { it.toInt() and 0xFF }.toMutableList()

        while (num.any { it != 0 }) {
            var remainder = 0
            val result = mutableListOf<Int>()
            for (digit in num) {
                val acc = digit + remainder * 256
                val div = acc / 58
                remainder = acc % 58
                if (result.isNotEmpty() || div != 0) {
                    result.add(div)
                }
            }
            encoded.add(BASE58_ALPHABET[remainder])
            num = result
        }

        repeat(leadingZeros) {
            encoded.add('1')
        }

        return encoded.reversed().joinToString("")
    }
}
