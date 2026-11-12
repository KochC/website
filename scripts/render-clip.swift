// Render a URL at an exact viewport size to PNG, clipped (no full-page growth).
// usage: swiftc -O scripts/render-clip.swift -o /tmp/render-clip
//        /tmp/render-clip <url> <out.png> <width> <height> [appearance]
import AppKit
import WebKit

let args = CommandLine.arguments
let url = URL(string: args[1])!
let out = args[2]
let width = CGFloat(Double(args[3]) ?? 1200)
let height = CGFloat(Double(args[4]) ?? 630)
let appearance = args.count > 5 ? args[5] : "dark"

final class Delegate: NSObject, WKNavigationDelegate {
    let hideSelector: String?

    init(hideSelector: String?) { self.hideSelector = hideSelector }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            if let selector = self.hideSelector {
                webView.evaluateJavaScript("document.querySelectorAll('\(selector)').forEach(function(e){e.style.display='none'})") { _, _ in }
            }
            let cfg = WKSnapshotConfiguration()
            cfg.rect = CGRect(x: 0, y: 0, width: width, height: height)
            cfg.snapshotWidth = NSNumber(value: Double(width))
            webView.takeSnapshot(with: cfg) { image, error in
                guard let image, let tiff = image.tiffRepresentation,
                      let rep = NSBitmapImageRep(data: tiff) else {
                    print("snapshot failed: \(String(describing: error))"); exit(1)
                }
                guard let png = rep.representation(using: .png, properties: [:]) else { exit(1) }
                try? png.write(to: URL(fileURLWithPath: out))
                print("wrote \(out) \(rep.pixelsWide)x\(rep.pixelsHigh)")
                exit(0)
            }
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let web = WKWebView(frame: NSRect(x: 0, y: 0, width: width, height: height))
let look = NSAppearance(named: appearance == "light" ? .aqua : .darkAqua)
app.appearance = look
web.appearance = look
let window = NSWindow(contentRect: web.frame, styleMask: [.borderless], backing: .buffered, defer: false)
window.contentView = web
// Optional 6th arg: a CSS selector to hide before snapshotting (e.g. a build
// badge that has no place in a marketing image).
let hideSelector = args.count > 6 ? args[6] : nil
let delegate = Delegate(hideSelector: hideSelector)
web.navigationDelegate = delegate
web.load(URLRequest(url: url))
DispatchQueue.main.asyncAfter(deadline: .now() + 30) { print("timeout"); exit(2) }
app.run()
