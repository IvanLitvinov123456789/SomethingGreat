from __future__ import annotations

import os
import socket
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BIND_HOST = "0.0.0.0"
LOCAL_HOST = "127.0.0.1"
START_PORT = 8017
BUILD = "20260617-5"
ROOT = Path(__file__).resolve().parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def find_free_port(start: int, attempts: int = 20) -> int:
    for port in range(start, start + attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind((BIND_HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError("Could not find a free port")


def get_lan_ip() -> str | None:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except OSError:
        return None


def main() -> None:
    os.chdir(ROOT)
    port = find_free_port(START_PORT)
    local_url = f"http://{LOCAL_HOST}:{port}/index.html?build={BUILD}"
    lan_ip = get_lan_ip()
    mobile_url = f"http://{lan_ip}:{port}/index.html?build={BUILD}" if lan_ip else None
    server = ThreadingHTTPServer((BIND_HOST, port), NoCacheHandler)

    def open_browser() -> None:
        time.sleep(0.8)
        webbrowser.open(local_url)

    threading.Thread(target=open_browser, daemon=True).start()
    print("Market Empire v0.3.3 mobile map build")
    print(f"Computer: {local_url}")
    if mobile_url:
        print(f"Phone on the same Wi-Fi: {mobile_url}")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
