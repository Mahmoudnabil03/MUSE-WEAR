import fs from "fs";
// Demo data removed — Taager import will populate products via D1/API. This script now generates header-only catalogs until Taager data is imported.
const products = [];
function esc(v){ const s=String(v??""); if(s.includes('"')||s.includes(',')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"'; return s; }
const origin='https://muse-wear.pages.dev';
const rows=products.map(p=>{
  const priceNum=p.price;
  const orig=p.originalPrice;
  const price=orig&&orig>priceNum? `${orig.toFixed(2)} EGP` : `${priceNum.toFixed(2)} EGP`;
  const sale=orig&&orig>priceNum? `${priceNum.toFixed(2)} EGP` : '';
  return {
    id:p.id,
    title:p.nameEn,
    description: `${p.nameEn} - ${p.brand} ${p.subcategory}. Ships across Egypt, 14-day returns.`,
    availability:'in stock',
    condition:'new',
    price,
    sale_price:sale,
    link: origin+'/product/'+p.id,
    image_link:p.image,
    additional_image_link:(p.images||[]).slice(1).join(','),
    brand:p.brand,
    product_type: `${p.category} > ${p.subcategory}`,
    inventory:'100'
  };
});
const headers=['id','title','description','availability','condition','price','sale_price','link','image_link','additional_image_link','brand','product_type','inventory'];
const csv=[headers.join(','),...rows.map(r=>headers.map(h=>esc(r[h]||'')).join(','))].join('\n');
fs.writeFileSync('public/catalog.csv', csv);
fs.writeFileSync('public/feed.csv', csv);
fs.writeFileSync('public/meta-catalog.csv', csv);
console.log('wrote public catalog csv rows:'+rows.length+' size:'+csv.length);
