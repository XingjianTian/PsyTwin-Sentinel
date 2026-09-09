import assert from "node:assert/strict"
import test from "node:test"

import {
  isPrivateIpv4,
  normalizeReachyNetworkHost,
  normalizeReachyNetworkPort,
} from "./reachy-network"

test("normalizes supported Reachy LAN hosts", () => {
  assert.equal(normalizeReachyNetworkHost(" 192.168.1.36 "), "192.168.1.36")
  assert.equal(normalizeReachyNetworkHost("Relay-A01.Local."), "relay-a01.local")
  assert.equal(normalizeReachyNetworkHost("a01-reachy.local"), "a01-reachy.local")
})

test("rejects URLs and public hostnames", () => {
  assert.throws(() => normalizeReachyNetworkHost("http://192.168.1.36"))
  assert.throws(() => normalizeReachyNetworkHost("example.com"))
  assert.throws(() => normalizeReachyNetworkHost("192.168.1.999"))
})

test("accepts loopback, private, and link-local IPv4 targets", () => {
  for (const address of ["127.0.0.1", "10.0.0.2", "172.16.0.2", "172.31.255.2", "192.168.8.9", "169.254.1.2"]) {
    assert.equal(isPrivateIpv4(address), true)
  }
  for (const address of ["127.0.0.2", "172.32.0.2", "8.8.8.8", "999.1.1.1"]) {
    assert.equal(isPrivateIpv4(address), false)
  }
})

test("normalizes and validates daemon ports", () => {
  assert.equal(normalizeReachyNetworkPort(undefined), 7862)
  assert.equal(normalizeReachyNetworkPort(8443), 8443)
  assert.throws(() => normalizeReachyNetworkPort(0))
  assert.throws(() => normalizeReachyNetworkPort(70000))
})
