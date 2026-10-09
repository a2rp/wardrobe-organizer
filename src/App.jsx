import { useEffect, useState } from "react";
import styles from "./App.module.css";
import SiteHeader from "./components/siteHeader";
import SiteFooter from "./components/siteFooter";
import BackToTop from "./components/backToTop";
import WardrobeOrganizer from "./components/wardrobeOrganizer";

const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className={styles["app-shell"]} id="top">
            <SiteHeader
                title="Wearwell"
                mark="W"
                navItems={[["Wardrobe", "#workspace"], ["Today outfit", "#outfit"]]}
                repoUrl="https://github.com/a2rp/wardrobe-organizer"
            />
            <main className={styles.pageContent}>
                <WardrobeOrganizer />
            </main>
            <SiteFooter repoUrl="https://github.com/a2rp/wardrobe-organizer" />
            <BackToTop visible={showBackToTop} />
        </div>
    );
};

export default App;