export const subscribeUserToPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            console.log('📡 Registering service worker...');
            const registration = await navigator.serviceWorker.register('/sw.js');

            console.log('✅ Service worker registered:', registration);

            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            console.log('🔑 Raw VAPID key:', vapidKey);

            const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
            console.log('🔑 Uint8Array VAPID key:', convertedVapidKey);

            console.log('🔐 Subscribing to push manager...');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
            });

            console.log('📬 Sending subscription to server...');
            const token = localStorage.getItem('token');
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subscription }),
            });

            if (!res.ok) throw new Error(`Failed to send push subscription (${res.status})`);

            console.log('✅ Push subscription successful');
       } catch (err) {
    if (Notification.permission !== 'granted') {
        console.warn('⚠️ Notifications are not granted');
    }

    if (err.name === 'AbortError') {
        console.error('❌ Push subscription failed: Brave or browser is blocking push subscription on localhost.');
    }

    console.error('📛 Full error object:', err);
}
    } else {
        console.warn('❗ Push notifications not supported');
    }
};

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
