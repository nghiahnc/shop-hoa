import Image from 'next/image';
import Link from 'next/link';
import { listProducts, listCategories } from '@/repositories/catalog.repository';
import { currentUser } from '@/lib/session';
import HomeHeader from './home/HomeHeader';
import HomeProduct from './home/HomeProduct';
import Reveal from './home/Reveal';
import { Arrow, BrandMark } from './home/Icons';
import styles from './home/Home.module.css';

export const dynamic = 'force-dynamic';

const occasions = [
  { name: 'Sinh nhật', image: '/images/product-01.jpg', caption: 'Một ngày riêng, một lời chúc đẹp.' },
  { name: 'Kỷ niệm', image: '/images/product-02.jpg', caption: 'Giữ lại những điều đáng nhớ.' },
  { name: 'Chúc mừng', image: '/images/product-04.jpg', caption: 'Cùng bạn đón một khởi đầu mới.' },
  { name: 'Cảm ơn', image: '/images/product-08.jpg', caption: 'Trao hoa, gửi lời từ trái tim.' },
];

export default async function Home() {
  const [products, categories, user] = await Promise.all([listProducts(), listCategories(), currentUser()]);
  return <div className={styles.home}>
    <a className={styles.skipLink} href="#main">Đến nội dung chính</a>
    <HomeHeader user={user} categories={categories} />
    <main id="main">
      <section className={styles.hero} aria-labelledby="hero-title">
        <Image className={styles.heroImage} src="/images/home-bouquet.jpg" alt="Hoa hồng phấn, tulip và lá xanh trong ánh sáng tự nhiên" fill sizes="100vw" loading="eager" fetchPriority="high" />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}><span className={styles.eyebrow}>MỘC HOA · FLOWER STUDIO</span><h1 id="hero-title">Để hoa kể<br />câu chuyện của bạn.</h1><Link className={styles.lightButton} href="/products">Khám phá hoa tươi <Arrow /></Link></div>
        <div className={styles.heroBottom}><span>MỖI BÓ HOA, MỘT LỜI THƯƠNG</span><a className={styles.scrollCue} href="#cau-chuyen" aria-label="Khám phá câu chuyện Mộc Hoa"><Arrow down /></a><span>MÙA HOA ĐANG NỞ</span></div>
      </section>
      <section id="cau-chuyen" className={styles.intro} aria-labelledby="intro-title"><Reveal><span className={styles.eyebrow}>VẺ ĐẸP TỪ NHỮNG ĐIỀU TỰ NHIÊN</span><h2 id="intro-title">Mỗi bó hoa là một<br /><span>lời nhắn dịu dàng.</span></h2><p>Chọn một sắc hoa thay lời muốn nói. Mộc Hoa chuẩn bị từng thiết kế với cảm hứng từ vẻ đẹp tự nhiên và những dịp quan trọng của bạn.</p><Link className={styles.textLink} href="/products">Tìm sắc hoa của bạn <Arrow /></Link></Reveal></section>
      <section className={styles.categories} aria-labelledby="occasions-title">
        <Reveal className={styles.sectionHeading}><div><span className={styles.eyebrow}>HOA CHO TỪNG KHOẢNH KHẮC</span><h2 id="occasions-title">Hôm nay, bạn muốn<br />gửi điều gì?</h2></div><p>Một lời chúc. Một lời thương.<br />Một bó hoa thay ngàn lời nói.</p></Reveal>
        <div className={styles.categoryGrid}>{occasions.map((occasion, index) => <Reveal key={occasion.name}><Link className={styles.categoryCard} href={`/products?occasion=${encodeURIComponent(occasion.name)}`}><Image src={occasion.image} alt="" fill sizes="(max-width:700px) 100vw, 50vw" /><div className={styles.categoryShade} /><span className={styles.categoryIndex}>0{index + 1}</span><div className={styles.categoryCaption}><div><h3>{occasion.name}</h3><p>{occasion.caption}</p></div><span className={styles.circleArrow}><Arrow /></span></div></Link></Reveal>)}</div>
      </section>
      <section className={styles.featured} aria-labelledby="featured-title"><Reveal className={styles.sectionHeading}><div><span className={styles.eyebrow}>ĐƯỢC NÂNG NIU, ĐƯỢC YÊU THÍCH</span><h2 id="featured-title">Hoa dành cho bạn.</h2></div><Link className={styles.textLink} href="/products">Tất cả thiết kế <Arrow /></Link></Reveal><div className={styles.productGrid}>{products.slice(0,3).map(product => <Reveal key={product.id}><HomeProduct product={product} /></Reveal>)}</div>{!products.length && <p>Các thiết kế hoa đang được cập nhật. Mời bạn ghé lại sau.</p>}</section>
      <section className={styles.closing} aria-labelledby="closing-title"><Image src="/images/home-florist.jpg" alt="Hoa tươi được chuẩn bị tại bàn làm hoa" fill sizes="100vw" /><div className={styles.closingShade} /><Reveal className={styles.closingContent}><span className={styles.eyebrow}>TỪ MỘC HOA, VỚI YÊU THƯƠNG</span><h2 id="closing-title">Gửi một chút thương.</h2><Link className={styles.lightButton} href="/products">Chọn hoa để trao <Arrow /></Link></Reveal></section>
    </main>
    <footer className={styles.footer}><div className={styles.footerTop}><Link className={styles.footerBrand} href="/" aria-label="Mộc Hoa — Trang chủ"><BrandMark /><span>Mộc Hoa<small>FLOWER STUDIO</small></span></Link><p>Hoa tươi cho những<br />khoảnh khắc đáng nhớ.</p><nav aria-label="Liên kết cuối trang"><Link href="/products">Hoa tươi <Arrow /></Link><Link href="/account/orders">Đơn hàng <Arrow /></Link><Link href="/admin">Quản trị <Arrow /></Link></nav></div><div className={styles.footerBottom}><span>© 2026 Mộc Hoa</span><span>Dự án demo / CV</span><a href="#main">Về đầu trang <Arrow down /></a></div></footer>
  </div>;
}
