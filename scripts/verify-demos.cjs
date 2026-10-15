const {chromium}=require('playwright');
const fs=require('node:fs');
const targets=[
 ['nexora','https://sergoneon.github.io/nexora-website/'],
 ['real-estate','https://sergoneon.github.io/israel-realtor-crm-demo/'],
 ['legal-cases','https://sergoneon.github.io/brill-case-demo/'],
 ['transport-saas','https://sergoneon.github.io/transport-saas-demo/'],
 ['transit-platform','https://sergoneon.github.io/israel-transit-platform-demo/'],
 ['brokerone','https://sergoneon.github.io/brokerone-live/'],
 ['legal-website','https://sergoneon.github.io/tomer-moshe-website-demo/']
];
(async()=>{
 fs.mkdirSync('verification/screenshots',{recursive:true});
 const browser=await chromium.launch({headless:true});
 const results=[];
 for(const [id,url] of targets){
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  let status=null,title='',error=null,screenshot=null;
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
   status=response?.status()??null;
   await page.waitForTimeout(1300);
   title=await page.title();
   if(status>=200&&status<400){
    screenshot='screenshots/'+id+'.png';
    await page.screenshot({path:'verification/'+screenshot,fullPage:true,animations:'disabled'});
   }else error='HTTP '+status;
  }catch(e){error=String(e.message).slice(0,300)}
  results.push({id,url,status,title,screenshot,error,checkedAt:new Date().toISOString()});
  console.log(id,status,error||'OK');
  await page.close();
 }
 await browser.close();
 fs.writeFileSync('verification/report.json',JSON.stringify(results,null,2));
 fs.writeFileSync('verification/README.md','# NEXORA demo verification\n\nThese screenshots are actual Chromium captures of public URLs. A screenshot is not proof that every feature works.\n\n'+results.map(x=>'- '+x.id+': '+(x.error||('HTTP '+x.status))+' '+(x.screenshot||'')).join('\n')+'\n');
 if(results.some(x=>x.error))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
