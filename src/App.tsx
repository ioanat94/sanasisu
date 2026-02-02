import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { Word, cases, wordlist } from "./utils/wordlist";
import { useRef, useState } from "react";

import { Game } from "./game/scenes/Game";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [currentSceneKey, setCurrentSceneKey] = useState<string>("");

    const [randomWord, setRandomWord] = useState<{
        word: string;
        tr: string;
        kotous: string;
        case: string;
        caseValue: string | undefined;
    }>(getRandomWord());
    const [playerAnswer, setPlayerAnswer] = useState<string>("");
    const [score, setScore] = useState<number>(0);

    console.log(randomWord);

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        setCurrentSceneKey(scene.scene.key);
    };

    const callLancelotTakeDamage = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as Game;

            if (
                scene &&
                "lancelot" in scene &&
                scene.lancelot &&
                typeof scene.lancelot.takeDamage === "function"
            ) {
                scene.lancelot.takeDamage();
            }
        }
    };

    const callEnemyTakeDamage = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as Game;

            if (
                scene &&
                "enemy" in scene &&
                scene.enemy &&
                typeof scene.enemy.takeDamage === "function"
            ) {
                scene.enemy.takeDamage();
            }
        }
    };

    const callWeaponAttack = (isLancelot: boolean) => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as Game;
            if (isLancelot) {
                scene.lancelotWeapon.playAttack();
            } else {
                scene.enemyWeapon.playAttack();
            }
        }
    };

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            {currentSceneKey === "Game" && (
                <form
                    style={formStyle}
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (playerAnswer === randomWord.caseValue) {
                            const newRandomWord = getRandomWord();
                            setRandomWord(newRandomWord);
                            setPlayerAnswer("");
                            callWeaponAttack(true);
                            callEnemyTakeDamage();
                            setScore(score + 1);
                        } else {
                            callWeaponAttack(false);
                            callLancelotTakeDamage();
                        }
                    }}
                >
                    <div style={scoreStyle}>Score: {score}</div>
                    <p style={wordStyle}>
                        {randomWord.word} | {randomWord.tr}
                    </p>
                    <p style={wordTypeStyle}>type: {randomWord.kotous}</p>
                    <p style={wordCaseStyle}>
                        {getFullCaseName(randomWord.case)}
                    </p>
                    <input
                        type="text"
                        placeholder="Enter answer..."
                        style={inputStyle}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#FFD700";
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#8D6E63";
                        }}
                        value={playerAnswer}
                        onChange={(e) => setPlayerAnswer(e.target.value)}
                    />
                </form>
            )}
        </div>
    );
}

function getRandomWord() {
    const randomWord = wordlist[Math.floor(Math.random() * wordlist.length)];
    const randomCaseKey = getRandomCase(randomWord);

    return {
        word: randomWord.word,
        tr: randomWord.tr,
        kotous: randomWord.kotous,
        case: randomCaseKey,
        caseValue: randomWord[randomCaseKey as keyof Word],
    };
}

function getRandomCase(word: Word) {
    const caseKeys = Object.keys(word).filter(
        (key) => key !== "word" && key !== "tr" && key !== "kotous",
    );
    const randomKey = caseKeys[Math.floor(Math.random() * caseKeys.length)];
    return randomKey;
}

function getFullCaseName(caseKey: string) {
    return cases[caseKey] || caseKey;
}

const formStyle: React.CSSProperties = {
    position: "absolute",
    top: 75,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
    pointerEvents: "auto",
    width: "fit-content",
    textAlign: "center",
    backgroundColor: "#3E2723",
    color: "#F5E9DA",
    borderRadius: "8px",
    boxShadow:
        "0 8px 24px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1), 0 0 0 12px #8D6E63",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minWidth: "320px",
    backgroundImage: `
            linear-gradient(rgba(139, 90, 43, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 90, 43, 0.1) 1px, transparent 1px)
        `,
    backgroundSize: "20px 20px",
};

const scoreStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: "bold",
    borderBottom: "2px solid #8D6E63",
    paddingBottom: "8px",
    marginBottom: "8px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
};

const wordStyle: React.CSSProperties = {
    margin: "4px 0",
    fontSize: "18px",
    fontWeight: "bold",
};

const wordTypeStyle: React.CSSProperties = {
    margin: "4px 0",
    fontStyle: "italic",
};

const wordCaseStyle: React.CSSProperties = {
    margin: "4px 0",
    fontSize: "16px",
    color: "#FFD700",
};

const inputStyle: React.CSSProperties = {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "2px solid #8D6E63",
    backgroundColor: "#FFEFD5",
    color: "#3E2723",
    fontFamily: "inherit",
};

export default App;
