const repository = 'Ceasiumz/Ceasiumz.github.io';
const issueApi = 'https://api.github.com/repos/' + repository + '/issues';
const maxBodyBytes = 4096;
const maxReportLength = 600;

async function readReport(request) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal:true });
  let bytes = 0;
  let json = '';
  try {
    for (;;) {
      const {value,done} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes>maxBodyBytes) {
        await reader.cancel();
        return '';
      }
      json += decoder.decode(value,{stream:true});
    }
    const {body} = JSON.parse(json+decoder.decode());
    return typeof body==='string' && body.length<=maxReportLength ? body.trim() : '';
  } catch {
    await reader.cancel().catch(()=>{});
    return '';
  } finally {
    reader.releaseLock();
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = { 'Cache-Control':'no-store', 'Vary':'Origin' };
    const reply = (status,data) => Response.json(data,{status,headers});
    if (!origin || origin!==env.SITE_ORIGIN) return reply(403,{error:'origin'});
    headers['Access-Control-Allow-Origin'] = origin;

    if (new URL(request.url).pathname!=='/feedback') return reply(404,{error:'route'});
    if (request.method==='OPTIONS') {
      return new Response(null,{status:204,headers:{
        ...headers,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type',
      }});
    }
    if (request.method!=='POST') return reply(405,{error:'method'});
    if (request.headers.get('Content-Type')?.split(';')[0]!=='application/json') {
      return reply(415,{error:'content-type'});
    }
    if (!env.GITHUB_ISSUES_TOKEN) return reply(503,{error:'unavailable'});

    const report = await readReport(request);
    if (!report) return reply(400,{error:'report'});
    const client = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const clientLimit = await env.CLIENT_LIMIT.limit({key:client});
    if (!clientLimit.success) return reply(429,{error:'rate-limit'});
    const siteLimit = await env.SITE_LIMIT.limit({key:'feedback'});
    if (!siteLimit.success) return reply(429,{error:'rate-limit'});

    const summary = Array.from(report.split(/\r?\n/,1)[0]).slice(0,72).join('').replaceAll('@','＠');
    // Render feedback as literal text so it cannot mention accounts or trigger cross-references.
    const body = 'Submitted anonymously through AlphaBridge.\n\n' +
      report.split(/\r?\n/).map(line=>'    '+line).join('\n');
    try {
      const result = await fetch(issueApi,{
        method:'POST',
        redirect:'error',
        headers:{
          'Authorization':'Bearer '+env.GITHUB_ISSUES_TOKEN,
          'Accept':'application/vnd.github+json',
          'Content-Type':'application/json',
          'User-Agent':'AlphaBridge-Feedback',
        },
        body:JSON.stringify({title:'[AlphaBridge] '+summary,body}),
      });
      if (result.status!==201) return reply(502,{error:'upstream'});
      const {number} = await result.json();
      if (!Number.isSafeInteger(number) || number<1) return reply(502,{error:'upstream'});
      return reply(201,{url:'https://github.com/'+repository+'/issues/'+number});
    } catch {
      return reply(502,{error:'upstream'});
    }
  },
};
