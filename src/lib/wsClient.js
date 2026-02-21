import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE } from "./api.js";
import { getSocketAccessToken } from "./auth.js";

let client = null;
let connectPromise = null;

function createClient() {
  const next = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE}/ws-stomp`),
    reconnectDelay: 4000
  });
  client = next;
  return next;
}

export async function connectWs({
  onWebSocketError,
  onStompError,
  onAuthFailure
} = {}) {
  if (client) {
    if (typeof onWebSocketError === "function") {
      client.onWebSocketError = onWebSocketError;
    }
    if (typeof onStompError === "function") {
      client.onStompError = onStompError;
    }
  }

  if (client?.connected) {
    return client;
  }
  if (connectPromise) {
    return connectPromise;
  }

  const next = client ?? createClient();

  next.beforeConnect = async () => {
    const token = await getSocketAccessToken();
    if (!token) {
      if (typeof onAuthFailure === "function") onAuthFailure();
      throw new Error("NO_SOCKET_TOKEN");
    }
    next.connectHeaders = { Authorization: `Bearer ${token}` };
  };

  if (typeof onWebSocketError === "function") {
    next.onWebSocketError = onWebSocketError;
  }
  if (typeof onStompError === "function") {
    next.onStompError = onStompError;
  }

  connectPromise = new Promise((resolve, reject) => {
    next.onConnect = () => {
      connectPromise = null;
      resolve(next);
    };

    next.onWebSocketClose = (evt) => {
      if (connectPromise) {
        connectPromise = null;
        reject(new Error(evt?.reason || "WS_CONNECT_CLOSED"));
      }
    };
  });

  next.activate();
  return connectPromise;
}

export function subscribeWs(destination, callback) {
  if (!client || !client.connected) return () => {};
  const sub = client.subscribe(destination, callback);
  return () => {
    try {
      sub.unsubscribe();
    } catch (err) {
      // ignore
    }
  };
}

export function publishWs({ destination, body }) {
  if (!client || !client.connected) return false;
  client.publish({ destination, body });
  return true;
}

export function disconnectWs() {
  if (connectPromise) {
    connectPromise = null;
  }
  if (client) {
    client.deactivate();
    client = null;
  }
}

export function isWsConnected() {
  return Boolean(client?.connected);
}
