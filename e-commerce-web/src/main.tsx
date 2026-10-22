import { FormEvent, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, Menu, Package, Search, ShoppingBag, Sparkles, Star, UserRound, X } from 'lucide-react';
import './styles.css';

type Product = { name: string; brand: string; price: string; rating: string; color: string; icon: string };
const products: Product[] = [
  { name: 'Orbit Pro Headphones', brand: 'SONIK', price: '₹7,499', rating: '4.8', color: 'lavender', icon: '◉' },
  { name: 'Terra Everyday Pack', brand: 'NOMAD', price: '₹2,999', rating: '4.6', color: 'peach', icon: '◒' },
  { name: 'Aura Smart Lamp', brand: 'LUMEN', price: '₹4,250', rating: '4.9', color: 'mint', icon: '◌' },
  { name: 'Canvas Weekender', brand: 'FIELD', price: '₹3,850', rating: '4.7', color: 'sky', icon: '◈' }
];
const api = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function App() {
  const [cart, setCart] = useState<Product[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<string | null>(localStorage.getItem('commerce.user'));
  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage(''); const form = new FormData(event.currentTarget);
    const payload = mode === 'login' ? { email: form.get('email'), password: form.get('password') } : { email: form.get('email'), password: form.get('password'), firstName: form.get('firstName'), lastName: form.get('lastName'), role: 'CUSTOMER' };
    try {
      const response = await fetch(`${api}/api/v1/auth/${mode === 'login' ? 'login' : 'register'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json(); if (!response.ok) throw new Error(data.detail ?? 'Unable to complete request');
      if (mode === 'register') { setMessage('Account created. Sign in to continue.'); setMode('login'); return; }
      localStorage.setItem('commerce.token', data.accessToken); localStorage.setItem('commerce.user', String(form.get('email'))); setProfile(String(form.get('email'))); setAuthOpen(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Network error. Is the gateway running?'); }
  };
  return <><header><a className="logo" href="#home">nexa<span>.</span></a><nav><a href="#shop">Shop</a><a href="#new">New arrivals</a><a href="#story">Our story</a></nav><div className="actions"><button aria-label="Search"><Search /></button><button aria-label="Saved items"><Heart /></button><button aria-label="Account" onClick={() => setAuthOpen(true)}><UserRound /></button><button className="bag" aria-label="Cart"><ShoppingBag /><b>{cart.length}</b></button><button className="mobile"><Menu /></button></div></header>
    <main id="home"><section className="hero"><div><p className="eyebrow"><Sparkles size={15}/> THE EDIT, CURATED FOR YOU</p><h1>Everyday objects.<br/><em>Extraordinary</em> feeling.</h1><p className="lede">Thoughtfully designed essentials for a more considered life.</p><a className="primary" href="#shop">Shop the collection <span>→</span></a></div><div className="hero-art"><div className="orb orb-one"/><div className="orb orb-two"/><div className="vessel">◒</div><small>01 — Spring / Summer</small></div></section>
      <section className="categories"><button>All things <span>24</span></button><button>Living <span>08</span></button><button>Wear <span>06</span></button><button>Tech <span>05</span></button><button>Travel <span>05</span></button></section>
      <section id="shop" className="catalog"><div className="section-head"><div><p className="eyebrow">DISCOVER</p><h2>Objects worth keeping.</h2></div><a href="#shop">View all products →</a></div><div className="grid">{products.map((product) => <article className="product" key={product.name}><div className={`product-art ${product.color}`}><button aria-label={`Save ${product.name}`}><Heart size={18}/></button><span>{product.icon}</span></div><div className="product-info"><p>{product.brand}</p><div><h3>{product.name}</h3><strong>{product.price}</strong></div><small><Star size={14} fill="currentColor"/> {product.rating}</small><button className="add" onClick={() => setCart([...cart, product])}>Add to bag</button></div></article>)}</div></section>
      <section id="story" className="promise"><Package size={30}/><div><p className="eyebrow">THE NEXA PROMISE</p><h2>Made to last. Chosen with care.</h2></div><p>We work with considered makers and materials, so every item earns a lasting place in your everyday.</p></section></main><footer><span>© 2026 NEXA COMMERCE</span><span>{profile ? `Signed in as ${profile}` : 'Secure checkout · Easy returns'}</span></footer>
    {authOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true"><button className="close" onClick={() => setAuthOpen(false)} aria-label="Close"><X/></button><p className="eyebrow">YOUR ACCOUNT</p><h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><form onSubmit={submitAuth}>{mode === 'register' && <div className="two"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div>}<label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength={12} required /></label><button className="primary" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button></form>{message && <p className="form-message">{message}</p>}<button className="switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></section></div>}</>;
}
createRoot(document.getElementById('root')!).render(<App />);
