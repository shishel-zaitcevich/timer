// 'use client';

// import { useState, useEffect } from 'react';

// export default function NotificationTest() {
//   const [logs, setLogs] = useState<string[]>([]);
//   const [permission, setPermission] = useState<NotificationPermission>('default');

//   const addLog = (message: string) => {
//     setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
//     console.log(message);
//   };

//   useEffect(() => {
//     setPermission(Notification.permission);
//     addLog(`Текущее разрешение: ${Notification.permission}`);
//     addLog(`User Agent: ${navigator.userAgent}`);
//   }, []);

//   const testBasicNotification = async () => {
//     try {
//       addLog('Запрос разрешения...');
//       const perm = await Notification.requestPermission();
//       setPermission(perm);
//       addLog(`Получено разрешение: ${perm}`);

//       if (perm === 'granted') {
//         addLog('Показываю уведомление...');
//         new Notification('Тест', {
//           body: 'Базовое уведомление работает!',
//           icon: '/icon-192x192.png',
//         });
//         addLog('Уведомление отправлено');
//       }
//     } catch (error: any) {
//       addLog(`ОШИБКА: ${error.message}`);
//     }
//   };

//   const testServiceWorker = async () => {
//     try {
//       if (!('serviceWorker' in navigator)) {
//         addLog('Service Worker не поддерживается');
//         return;
//       }

//       addLog('Регистрация Service Worker...');
//       const reg = await navigator.serviceWorker.register('/sw.js');
//       addLog('Service Worker зарегистрирован');

//       await navigator.serviceWorker.ready;
//       addLog('Service Worker готов');

//       if (!('PushManager' in window)) {
//         addLog('Push API не поддерживается');
//         return;
//       }

//       addLog('Проверка подписки...');
//       const existingSub = await reg.pushManager.getSubscription();
//       addLog(`Существующая подписка: ${existingSub ? 'Да' : 'Нет'}`);
//     } catch (error: any) {
//       addLog(`ОШИБКА SW: ${error.message}`);
//     }
//   };

//   const testPushSubscription = async () => {
//     try {
//       addLog('Попытка подписки на Push...');

//       const reg = await navigator.serviceWorker.ready;

//       // Используем тестовый ключ (замените на свой)
//       const testKey =
//         'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

//       const subscription = await reg.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(testKey),
//       });

//       addLog('Подписка успешна!');
//       addLog(`Endpoint: ${subscription.endpoint.substring(0, 50)}...`);
//     } catch (error: any) {
//       addLog(`ОШИБКА Push: ${error.name} - ${error.message}`);
//     }
//   };

//   const testNotificationPermissionInSettings = () => {
//     addLog('Проверьте настройки браузера:');
//     addLog('Chrome Android: Настройки → Уведомления → Сайты → Найдите ваш сайт');
//     addLog('Убедитесь, что уведомления не заблокированы глобально');
//   };

//   const clearLogs = () => setLogs([]);

//   return (
//     <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
//       <h1>🧪 Тест Push-уведомлений</h1>

//       <div
//         style={{
//           marginBottom: '20px',
//           padding: '15px',
//           background: '#f0f0f0',
//           borderRadius: '8px',
//         }}
//       >
//         <p>
//           <strong>Текущее разрешение:</strong> {permission}
//         </p>
//         <p>
//           <strong>HTTPS:</strong> {window.location.protocol === 'https:' ? '✅ Да' : '❌ Нет'}
//         </p>
//       </div>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
//         <button onClick={testBasicNotification} style={buttonStyle}>
//           1️⃣ Тест базового уведомления
//         </button>

//         <button onClick={testServiceWorker} style={buttonStyle}>
//           2️⃣ Тест Service Worker
//         </button>

//         <button onClick={testPushSubscription} style={buttonStyle}>
//           3️⃣ Тест Push-подписки
//         </button>

//         <button onClick={testNotificationPermissionInSettings} style={buttonStyle}>
//           4️⃣ Проверить настройки
//         </button>

//         <button onClick={clearLogs} style={{ ...buttonStyle, background: '#999' }}>
//           🗑️ Очистить логи
//         </button>
//       </div>

//       <div
//         style={{
//           background: '#1e1e1e',
//           color: '#00ff00',
//           padding: '15px',
//           borderRadius: '8px',
//           fontFamily: 'monospace',
//           fontSize: '12px',
//           maxHeight: '400px',
//           overflow: 'auto',
//         }}
//       >
//         {logs.length === 0 ? (
//           <p>Логи появятся здесь...</p>
//         ) : (
//           logs.map((log, i) => (
//             <div key={i} style={{ marginBottom: '5px' }}>
//               {log}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// const buttonStyle: React.CSSProperties = {
//   padding: '12px 20px',
//   fontSize: '16px',
//   background: '#667eea',
//   color: 'white',
//   border: 'none',
//   borderRadius: '8px',
//   cursor: 'pointer',
//   fontWeight: '600',
// };

// function urlBase64ToUint8Array(base64String: string) {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
//   const rawData = atob(base64);
//   const outputArray = new Uint8Array(rawData.length);
//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }
