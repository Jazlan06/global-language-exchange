self.addEventListener('push', event => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const redirectUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(redirectUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(redirectUrl);
      }
    })
  );
});

