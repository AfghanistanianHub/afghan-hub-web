import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'afghan-local-journey-'));
mkdirSync(join(dir,'supabase'));
let config=readFileSync('supabase/config.toml','utf8').replace('project_id = "afghan-hub-web"','project_id = "afghan-hub-local-journey"');
for(const [from,to] of [[54321,55321],[54322,55322],[54320,55320],[54323,55323],[54324,55324],[54329,55329]])config=config.replaceAll(String(from),String(to));
config=config.replace('openai_api_key = "env(OPENAI_API_KEY)"','').replace(/(\[db.seed\]\nenabled = )true/,'$1false');
config=config.replace(/(\[auth.email\][\s\S]*?enable_confirmations = )false/,'$1true');
// Exact loopback callback for the disposable browser fixture only.
config=config.replace('site_url = "http://127.0.0.1:3000"','site_url = "http://localhost:3100"').replace('additional_redirect_urls = ["https://127.0.0.1:3000"]','additional_redirect_urls = ["http://localhost:3100/auth/callback?next=/dashboard&flow=signup"]');
writeFileSync(join(dir,'supabase/config.toml'),config);
cpSync('supabase/migrations',join(dir,'supabase/migrations'),{recursive:true});
if(process.env.GITHUB_ENV)appendFileSync(process.env.GITHUB_ENV,`LOCAL_QA_DIR=${dir}\n`);
console.log(dir);
