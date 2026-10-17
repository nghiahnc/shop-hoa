'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { addCart } from '@/lib/cart';
import type { CatalogProduct } from '@/repositories/catalog.repository';
import { Arrow, Icon } from './Icons';
import styles from './Home.module.css';

export default function HomeProduct({ product }: { product: CatalogProduct }) {
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function add() {
    try {
      addCart(product.id);
      setAdded(true); setError('');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(false), 1800);
    } catch { setError('Không thể lưu giỏ hàng. Vui lòng cho phép lưu trữ trong trình duyệt.'); }
  }
  return <article className={styles.product}>
    <Link className={styles.productPhoto} href={`/products/${product.slug}`} aria-label={`Xem ${product.name}`}><Image src={product.image_path} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" /><span className={styles.productServing}>{product.occasion}</span><span className={styles.productExplore}><Arrow /></span></Link>
    <div className={styles.productInfo}><span className={styles.productCategory}>{product.category} · {product.flower_style}</span><h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3><p>{product.description}</p><div className={styles.productBottom}><strong>{new Intl.NumberFormat('vi-VN').format(product.price_vnd)} <small>₫</small></strong><button className={styles.addButton} type="button" disabled={product.stock < 1} onClick={add} aria-label={product.stock < 1 ? `${product.name} đã hết hàng` : `Thêm ${product.name} vào giỏ`}><span>{product.stock < 1 ? 'Hết hàng' : added ? 'Đã thêm' : 'Thêm vào giỏ'}</span><Icon name={added ? 'check' : 'plus'} /></button></div><span className={styles.productStatus} role="status">{error || (added ? `Đã thêm ${product.name} vào giỏ hàng.` : '')}</span></div>
  </article>;
}
