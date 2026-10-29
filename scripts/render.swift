// Render a URL to PNG with WebKit (same engine as Safari).
// usage: swiftc -O scripts/render.swift -o /tmp/render && /tmp/render <url> <out.png> <width> [height]
//        (width < 600 also sets an iPhone user agent; APPEARANCE=light|dark forces the color scheme)
import AppKit
import WebKit

let args = CommandLine.arguments
let url = URL(string: args[1])!
let out = args[2]
let width = CGFloat(Double(args[3]) ?? 1280)
let height = CGFloat(Double(args.count > 4 ? args[4] : "900") ?? 900)

final class Delegate: NSObject, WKNavigationDelegate {
    let web: WKWebView
    init(web: WKWebView) { self.web = web }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            webView.evaluateJavaScript("document.documentElement.scrollHeight") { h, _ in
                let full = CGFloat((h as? Double) ?? Double(height))
                webView.setFrameSize(NSSize(width: width, height: full))
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    let cfg = WKSnapshotConfiguration()
                    cfg.rect = CGRect(x: 0, y: 0, width: width, height: full)
                    webView.takeSnapshot(with: cfg) { image, error in
                        guard let image, let tiff = image.tiffRepresentation,
                              let rep = NSBitmapImageRep(data: tiff),
                              let png = rep.representation(using: .png, properties: [:]) else {
                            print("snapshot failed: \(String(describing: error))"); exit(1)
                        }
                        try? png.write(to: URL(fileURLWithPath: out))
                        print("wrote \(out) \(Int(width))x\(Int(full))")
                        exit(0)
                    }
                }
            }
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let config = WKWebViewConfiguration()
let web = WKWebView(frame: NSRect(x: 0, y: 0, width: width, height: height), configuration: config)
if width < 600 {
    web.customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
}
if let mode = ProcessInfo.processInfo.environment["APPEARANCE"] {
    let look = NSAppearance(named: mode == "light" ? .aqua : .darkAqua)
    app.appearance = look
    web.appearance = look
}
let window = NSWindow(contentRect: web.frame, styleMask: [.borderless], backing: .buffered, defer: false)
window.contentView = web
let delegate = Delegate(web: web)
web.navigationDelegate = delegate
web.load(URLRequest(url: url))
DispatchQueue.main.asyncAfter(deadline: .now() + 30) { print("timeout"); exit(2) }
app.run()
