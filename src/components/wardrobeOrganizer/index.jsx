import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiPlus, FiTag, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../confirmDialog";
import styles from "./styles.module.css";

const itemKey = "wearwell-wardrobe";
const outfitKey = "wearwell-outfit";
const starterItems = [
    { id: 1, name: "Everyday linen shirt", type: "Tops", season: "Spring", color: "#9fbbc1", price: 68, wears: 14 },
    { id: 2, name: "Straight-leg denim", type: "Bottoms", season: "All year", color: "#697a9c", price: 92, wears: 21 },
    { id: 3, name: "Soft knit cardigan", type: "Layers", season: "Autumn", color: "#bd8b68", price: 110, wears: 9 },
    { id: 4, name: "Canvas low-tops", type: "Shoes", season: "All year", color: "#d3c5a9", price: 74, wears: 31 },
    { id: 5, name: "Cotton poplin dress", type: "One-pieces", season: "Summer", color: "#c27b8e", price: 88, wears: 7 },
    { id: 6, name: "Light rain jacket", type: "Layers", season: "Spring", color: "#7f8c6b", price: 125, wears: 11 },
];
const readValue = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const WardrobeOrganizer = () => {
    const [items, setItems] = useState(() => readValue(itemKey, starterItems));
    const [outfit, setOutfit] = useState(() => readValue(outfitKey, [2, 4]));
    const [type, setType] = useState("All pieces");
    const [season, setSeason] = useState("Every season");
    const [query, setQuery] = useState("");
    const [draft, setDraft] = useState({ name: "", type: "Tops", season: "All year", color: "#a6b8af", price: "" });
    const [pendingDelete, setPendingDelete] = useState(null);
    useEffect(() => localStorage.setItem(itemKey, JSON.stringify(items)), [items]);
    useEffect(() => localStorage.setItem(outfitKey, JSON.stringify(outfit)), [outfit]);

    const types = ["All pieces", ...new Set(items.map((item) => item.type))];
    const seasons = ["Every season", ...new Set(items.map((item) => item.season))];
    const visibleItems = useMemo(() => items.filter((item) => {
        const matchesText = (item.name + " " + item.type).toLowerCase().includes(query.toLowerCase());
        return matchesText && (type === "All pieces" || item.type === type) && (season === "Every season" || item.season === season);
    }), [items, type, season, query]);
    const outfitItems = outfit.map((id) => items.find((item) => item.id === id)).filter(Boolean);
    const totalValue = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

    const addItem = (event) => {
        event.preventDefault();
        if (!draft.name.trim()) return;
        setItems((current) => [...current, { ...draft, id: Date.now(), name: draft.name.trim(), price: Number(draft.price) || 0, wears: 0 }]);
        setDraft({ name: "", type: "Tops", season: "All year", color: "#a6b8af", price: "" });
    };
    const toggleOutfit = (id) => setOutfit((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    const wearToday = () => {
        if (!outfitItems.length) return;
        setItems((current) => current.map((item) => outfit.includes(item.id) ? { ...item, wears: item.wears + 1 } : item));
        setOutfit([]);
    };
    const removeItem = () => {
        setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
        setOutfit((current) => current.filter((id) => id !== pendingDelete.id));
        setPendingDelete(null);
    };

    return (
        <section className={styles.wardrobeOrganizer} id="workspace">
            <div className={styles.intro}>
                <div><p className={styles.label}>A CLOSET THAT WORKS FOR YOU</p><h1>Wear what you<br /><span>already love.</span></h1><p className={styles.description}>Keep track of your pieces, then pull a look together for today.</p></div>
                <div className={styles.valueCard}><FiTag aria-hidden="true" /><span>YOUR CLOSET</span><strong>{items.length} pieces</strong><small>{"$" + totalValue.toLocaleString()} added value</small></div>
            </div>
            <div className={styles.mainLayout}>
                <section className={styles.closetPanel} aria-label="Wardrobe items">
                    <div className={styles.closetHeading}><div><h2>Your wardrobe</h2><p>Filter by kind or season.</p></div><label className={styles.searchField}>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="A piece or color" aria-label="Search wardrobe" /></label></div>
                    <div className={styles.filterRow}>
                        <div className={styles.typeTabs} role="group" aria-label="Filter clothing type">{types.map((value) => <button type="button" key={value} className={type === value ? styles.activeType : ""} onClick={() => setType(value)}>{value}</button>)}</div>
                        <label className={styles.seasonSelect}><span>Season</span><select value={season} onChange={(event) => setSeason(event.target.value)}>{seasons.map((value) => <option key={value}>{value}</option>)}</select></label>
                    </div>
                    <div className={styles.clothingGrid}>
                        {visibleItems.map((item) => {
                            const inOutfit = outfit.includes(item.id);
                            return <article className={styles.clothingCard} key={item.id}>
                                <div className={styles.clothingArt} style={{ backgroundColor: item.color }}><FiTag aria-hidden="true" /><span>{item.type}</span></div>
                                <div className={styles.clothingInfo}><div className={styles.itemTop}><span className={styles.swatch} style={{ backgroundColor: item.color }}></span><span>{item.season}</span><button type="button" className={styles.deleteButton} aria-label={"Delete " + item.name} onClick={() => setPendingDelete(item)}><FiTrash2 aria-hidden="true" /></button></div><h3>{item.name}</h3><p>{item.wears} wears so far <span>·</span> {"$" + item.price}</p><button type="button" className={inOutfit ? styles.addedButton : styles.outfitButton} aria-pressed={inOutfit} onClick={() => toggleOutfit(item.id)}>{inOutfit ? <><FiCheck aria-hidden="true" /> In today outfit</> : "Add to today outfit"}</button></div>
                            </article>;
                        })}
                        {visibleItems.length === 0 && <p className={styles.emptyState}>No pieces match those filters. Add one below.</p>}
                    </div>
                    <form className={styles.addForm} id="add" onSubmit={addItem}>
                        <h3>Add a wardrobe piece</h3>
                        <label>Name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Wool coat" /></label>
                        <label>Type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>{["Tops", "Bottoms", "Layers", "Shoes", "One-pieces", "Accessories"].map((value) => <option key={value}>{value}</option>)}</select></label>
                        <label>Season<select value={draft.season} onChange={(event) => setDraft({ ...draft, season: event.target.value })}>{["All year", "Spring", "Summer", "Autumn", "Winter"].map((value) => <option key={value}>{value}</option>)}</select></label>
                        <label>Color<input type="color" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} /></label>
                        <label>Price<input type="number" min="0" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="0" /></label>
                        <button type="submit" className={styles.addButton}><FiPlus aria-hidden="true" /> Add piece</button>
                    </form>
                </section>
                <aside className={styles.outfitPanel} id="outfit">
                    <div className={styles.outfitHeader}><div className={styles.outfitMark}><FiTag aria-hidden="true" /></div><span>TODAY, YOUR WAY</span><h2>Outfit for today</h2><p>Pick from what is already in your closet.</p></div>
                    <div className={styles.outfitItems}>
                        {outfitItems.map((item) => <div className={styles.outfitItem} key={item.id}><span style={{ backgroundColor: item.color }}></span><div><strong>{item.name}</strong><small>{item.type}</small></div><button type="button" aria-label={"Remove " + item.name + " from outfit"} onClick={() => toggleOutfit(item.id)}>×</button></div>)}
                        {outfitItems.length === 0 && <p className={styles.outfitEmpty}>Your outfit is open. Add a few pieces from the wardrobe.</p>}
                    </div>
                    <button type="button" className={styles.wearButton} disabled={!outfitItems.length} onClick={wearToday}>Wear this today <FiCheck aria-hidden="true" /></button>
                    <p className={styles.outfitNote}>Wearing a look adds one wear to each piece and clears the outfit.</p>
                </aside>
            </div>
            <p className={styles.storageNote}>Your wardrobe and outfit stay in this browser. The organizer does not include garment photos or cloud sync.</p>
            {pendingDelete && <ConfirmDialog title="Remove this wardrobe piece?" description={"“" + pendingDelete.name + "” will be removed from your closet and today outfit."} onCancel={() => setPendingDelete(null)} onConfirm={removeItem} />}
        </section>
    );
};

export default WardrobeOrganizer;
