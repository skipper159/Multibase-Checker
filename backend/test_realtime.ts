import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const supabase = createClient('https://my-project-api.tyto-design.de', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzczMTU0OTgxLCJleHAiOjIwODg1MTQ5ODF9.yBU4h0apv2ycQhRRAvNaA7S9L_qr2M-o5AKitl6v8cI', {
  global: { WebSocket: WebSocket as any },
  realtime: {
    // Force version 1.0.0 so supabase-js uses Text frames (JSON) instead of Binary frames
    vsn: '1.0.0'
  } as any
});

const channel = supabase.channel('test-channel', { config: { broadcast: { self: true } } });
channel.on('broadcast', { event: 'test' }, payload => {
  console.log('Received payload:', payload);
}).subscribe(async (status, err) => {
  console.log('Status:', status);
  if(err) console.error('Error:', err);
  
  if (status === 'SUBSCRIBED') {
    console.log('Sending broadcast...');
    await channel.send({
      type: 'broadcast',
      event: 'test',
      payload: { message: 'hello' }
    });
  } else {
    setTimeout(() => process.exit(0), 3000);
  }
});
