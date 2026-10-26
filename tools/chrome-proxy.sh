#!/bin/bash
# Remotion launches Chrome with --no-proxy-server; this wrapper drops those flags and routes Chrome through the
# sandbox proxy ($HTTPS_PROXY, read at run time) so Google Fonts load. TLS checks stay on (proxy CA is in NSS).
args=()
for a in "$@"; do case "$a" in --no-proxy-server|--proxy-server=*|--proxy-bypass-list=*) ;; *) args+=("$a");; esac; done
exec /opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --proxy-server="${HTTPS_PROXY:-http://127.0.0.1:46473}" --proxy-bypass-list="localhost;127.0.0.1" "${args[@]}"
