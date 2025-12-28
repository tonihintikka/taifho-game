import React, { useState } from 'react';
import './HelpPanel.css';

type Language = 'en' | 'fi';

const translations = {
    en: {
        title: 'How to Play',
        goal: 'Goal: Move all your pieces to the opposite side of the board.',
        controls: 'Controls: Drag and drop pieces to move them.',
        turnOrder: 'Turn Order: Red starts, then Blue. In 4-player game: Red → Green → Blue → Yellow.',
        pieces: 'Piece Movements:',
        square: 'Square ■ — Moves orthogonally (↑↓←→)',
        diamond: 'Diamond ◆ — Moves diagonally (↗↘↙↖)',
        triangle: 'Triangle ▲ — Diagonally forward or straight backward',
        circle: 'Circle ● — All 8 directions',
        jump: 'Jump: Hop over any adjacent piece to land behind it.',
        chain: 'Chain Jump: Multiple jumps allowed in one turn.',
        leap: 'Leap: Long symmetric jump over a piece with equal empty spaces before and after.',
    },
    fi: {
        title: 'Peliohjeet',
        goal: 'Tavoite: Siirrä kaikki palasi vastustajan puolelle lautaa.',
        controls: 'Ohjaus: Vedä ja pudota paloja siirtääksesi niitä.',
        turnOrder: 'Vuorojärjestys: Punainen aloittaa, sitten Sininen. 4 pelaajan pelissä: Punainen → Vihreä → Sininen → Keltainen.',
        pieces: 'Palojen liikkeet:',
        square: 'Neliö ■ — Liikkuu suoraan (↑↓←→)',
        diamond: 'Salmiakki ◆ — Liikkuu vinottain (↗↘↙↖)',
        triangle: 'Kolmio ▲ — Vinottain eteenpäin tai suoraan taaksepäin',
        circle: 'Ympyrä ● — Kaikki 8 suuntaa',
        jump: 'Hyppy: Hyppää viereisen palan yli tyhjään ruutuun.',
        chain: 'Sarjahyppy: Useita hyppyjä yhdellä vuorolla.',
        leap: 'Loikka: Pitkä hyppy esteen yli, kun tyhjät ruudut ennen ja jälkeen ovat symmetriset.',
    }
};

export const HelpPanel: React.FC = () => {
    const [lang, setLang] = useState<Language>('fi');
    const t = translations[lang];

    return (
        <div className="help-panel">
            <div className="lang-switcher">
                <button
                    className={lang === 'fi' ? 'active' : ''}
                    onClick={() => setLang('fi')}
                >
                    Suomi
                </button>
                <button
                    className={lang === 'en' ? 'active' : ''}
                    onClick={() => setLang('en')}
                >
                    English
                </button>
            </div>

            <h2>{t.title}</h2>
            <p className="goal">{t.goal}</p>
            <p className="controls">{t.controls}</p>
            <p className="controls">{t.turnOrder}</p>

            <h3>{t.pieces}</h3>
            <ul className="piece-rules">
                <li>{t.square}</li>
                <li>{t.diamond}</li>
                <li>{t.triangle}</li>
                <li>{t.circle}</li>
            </ul>

            <h3>{lang === 'fi' ? 'Erikoissiirrot' : 'Special Moves'}</h3>
            <ul className="special-rules">
                <li>{t.jump}</li>
                <li>{t.chain}</li>
                <li>{t.leap}</li>
            </ul>
        </div>
    );
};
