import fs from "fs";
const products = [
  { id: 'mw-001', nameEn: 'MUSE Oversized Heavy Tee - Black', brand: 'MUSE WEAR', category: 'men', subcategory: 'T-Shirts', price: 899, originalPrice: 1199, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=60'] },
  { id: 'mw-002', nameEn: 'MUSE Tailored Cargo Pants', brand: 'MUSE WEAR', category: 'men', subcategory: 'Pants', price: 1499, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=60'] },
  { id: 'mw-003', nameEn: 'Satin Wrap Dress - Emerald', brand: 'MUSE WEAR', category: 'women', subcategory: 'Dresses', price: 1899, originalPrice: 2499, image: 'https://images.unsplash.com/photo-1515372039744-f1fd71e2d06a?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1515372039744-f1fd71e2d06a?w=600&auto=format&fit=crop&q=60'] },
  { id: 'mw-004', nameEn: 'Cropped Bomber Jacket', brand: 'MUSE WEAR', category: 'women', subcategory: 'Jackets', price: 2199, image: 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600&auto=format&fit=crop&q=60'] },
  { id: 'br-001', nameEn: 'Nike Air Max 270 - White/Black', brand: 'Nike', category: 'men', subcategory: 'Shoes', price: 4299, originalPrice: 5499, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60'] },
  { id: 'br-002', nameEn: 'Adidas Originals Hoodie', brand: 'Adidas', category: 'women', subcategory: 'Hoodies', price: 1799, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=60'] },
  { id: 'acc-001', nameEn: 'MUSE Leather Crossbody Bag', brand: 'MUSE WEAR', category: 'accessories', subcategory: 'Bags', price: 1299, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60'] },
  { id: 'acc-002', nameEn: 'Chunky Gold Hoops Set', brand: 'MUSE WEAR', category: 'accessories', subcategory: 'Jewelry', price: 499, originalPrice: 699, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&auto=format&fit=crop&q=60'] },
  { id: 'br-003', nameEn: 'Puma RS-X - Multicolor', brand: 'Puma', category: 'men', subcategory: 'Shoes', price: 3599, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60'] },
  { id: 'mw-005', nameEn: 'MUSE Linen Co-ord Set - Sand', brand: 'MUSE WEAR', category: 'women', subcategory: 'Co-ords', price: 2499, image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60'] },
  { id: 'acc-003', nameEn: 'Unisex Cap - MW Embroidery', brand: 'MUSE WEAR', category: 'accessories', subcategory: 'Caps', price: 399, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60'] },
  { id: 'br-004', nameEn: "Levi's 501 Straight Jeans", brand: "Levi's", category: 'men', subcategory: 'Jeans', price: 1999, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60', images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60'] },
];
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
