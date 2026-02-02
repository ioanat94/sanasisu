import {
    GameState,
    clearGameState,
    getHighscore,
    loadGameState,
    saveGameState,
    saveHighscore,
} from "./utils/storage";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { Word, cases, wordlist } from "./utils/wordlist";
import { useEffect, useRef, useState } from "react";

import { EnemySprite } from "./game/objects/sprites/Enemy";
import { EventBus } from "./game/EventBus";
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
    const [highscore, setHighscore] = useState<number>(getHighscore());
    const [showHelp, setShowHelp] = useState(false);
    const [showGameOver, setShowGameOver] = useState(false);
    const [inputBorderColor, setInputBorderColor] = useState<string>("#8D6E63");

    useEffect(() => {
        const handleShowHelp = () => {
            setShowHelp(true);
        };

        const handleGameOver = () => {
            saveHighscore(score);
            setHighscore(getHighscore());
            setShowGameOver(true);
            clearGameState();
        };

        const handleEnemySpawned = () => {
            setTimeout(() => {
                saveCurrentGameState();
            }, 100);
        };

        const handleSoundToggled = () => {
            setTimeout(() => {
                saveCurrentGameState();
            }, 100);
        };

        EventBus.on("show-help", handleShowHelp);
        EventBus.on("game-over", handleGameOver);
        EventBus.on("enemy-spawned", handleEnemySpawned);
        EventBus.on("sound-toggled", handleSoundToggled);

        return () => {
            EventBus.off("show-help", handleShowHelp);
            EventBus.off("game-over", handleGameOver);
            EventBus.off("enemy-spawned", handleEnemySpawned);
            EventBus.off("sound-toggled", handleSoundToggled);
        };
    }, [score]);

    useEffect(() => {
        const savedState = loadGameState();
        if (savedState && phaserRef.current) {
            setScore(savedState.score);
            setRandomWord(savedState.currentWord);

            const restoreState = () => {
                const scene = phaserRef.current?.scene as Game;
                if (scene && scene.lancelot && scene.enemy) {
                    scene.lancelot.setHealth(savedState.lancelotHealth);

                    if (scene.enemy.getTexture() !== savedState.enemySprite) {
                        scene.enemy.destroy();
                        scene.enemy = EnemySprite.createEnemy(
                            scene,
                            860,
                            550,
                            savedState.enemySprite,
                        );
                        scene.add.existing(scene.enemy);
                    }

                    scene.enemy.setHealth(savedState.enemyHealth);

                    if (savedState.isMuted !== undefined) {
                        scene.setMuted(savedState.isMuted);
                    }
                }
            };

            if (currentSceneKey === "Game") {
                setTimeout(restoreState, 100);
            } else {
                EventBus.on("current-scene-ready", restoreState);
                return () => {
                    EventBus.off("current-scene-ready", restoreState);
                };
            }
        }
    }, [currentSceneKey]);

    const saveCurrentGameState = (
        currentScore?: number,
        currentWord?: typeof randomWord,
    ) => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as Game;
            if (scene && scene.lancelot && scene.enemy) {
                const state: GameState = {
                    score: currentScore !== undefined ? currentScore : score,
                    lancelotHealth: scene.lancelot.getHealth(),
                    enemyHealth: scene.enemy.getHealth(),
                    enemySprite: scene.enemy.getTexture(),
                    isMuted: scene.isMuted,
                    currentWord:
                        currentWord !== undefined ? currentWord : randomWord,
                };
                saveGameState(state);
            }
        }
    };

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

    const handleRestart = () => {
        setShowGameOver(false);
        setScore(0);
        setPlayerAnswer("");
        setRandomWord(getRandomWord());
        clearGameState();

        if (phaserRef.current) {
            const scene = phaserRef.current.scene as Game;
            scene.scene.restart();
        }
    };

    console.log(randomWord);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            {currentSceneKey === "Game" && (
                <form
                    style={formStyle}
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (playerAnswer.trim() === "") return;

                        if (playerAnswer === randomWord.caseValue) {
                            const newRandomWord = getRandomWord();
                            setRandomWord(newRandomWord);
                            setPlayerAnswer("");
                            callWeaponAttack(true);
                            callEnemyTakeDamage();
                            const newScore = score + 1;
                            setScore(newScore);

                            setTimeout(() => {
                                saveCurrentGameState(newScore, newRandomWord);
                            }, 100);

                            setInputBorderColor("#4CAF50");
                            setTimeout(
                                () => setInputBorderColor("#8D6E63"),
                                500,
                            );
                        } else {
                            callWeaponAttack(false);
                            callLancelotTakeDamage();

                            setTimeout(() => {
                                saveCurrentGameState();
                            }, 100);

                            setInputBorderColor("#F44336");
                            setTimeout(
                                () => setInputBorderColor("#8D6E63"),
                                500,
                            );
                        }
                    }}
                >
                    <div style={scoreStyle}>Score: {score}</div>
                    <p style={wordStyle}>
                        {randomWord.word} | {randomWord.tr}
                    </p>
                    <p style={wordKotusStyle}>kotus: {randomWord.kotous}</p>
                    <p style={wordCaseStyle}>
                        {getFullCaseName(randomWord.case)}
                    </p>
                    <input
                        type="text"
                        placeholder="Enter answer..."
                        style={{ ...inputStyle, borderColor: inputBorderColor }}
                        onFocus={(e) => {
                            if (inputBorderColor === "#8D6E63") {
                                e.currentTarget.style.borderColor = "#FFD700";
                            }
                        }}
                        onBlur={(e) => {
                            if (inputBorderColor === "#8D6E63") {
                                e.currentTarget.style.borderColor = "#8D6E63";
                            }
                        }}
                        value={playerAnswer}
                        onChange={(e) => setPlayerAnswer(e.target.value)}
                    />
                </form>
            )}

            {showHelp && (
                <div style={helpOverlayStyle}>
                    <div style={helpContentStyle}>
                        <h2 style={helpTitleStyle}>How to Play</h2>
                        <p style={helpTextStyle}>
                            Defeat monsters with the power of words! To attack,
                            correctly inflect the given Finnish word into the
                            specified case and number. Each correct answer deals
                            damage to your enemy, while incorrect answers damage
                            your character.
                        </p>
                        <div style={helpInstructionsWrapperStyle}>
                            <div style={helpInstructionsParagraphWrapperStyle}>
                                <p style={helpTextStyle}>
                                    1. Your total score. Each correct answer
                                    increases your score by 1.
                                </p>
                                <p style={helpTextStyle}>
                                    2. The given word in Finnish along with its
                                    English translation.
                                </p>
                                <p style={helpTextStyle}>
                                    3. The word kotus type. This should give you
                                    a hint as to how the word should be
                                    inflected.
                                </p>
                            </div>
                            <img
                                src="assets/how-to.png"
                                alt="Help Illustration"
                                style={helpImageStyle}
                            />
                        </div>
                        <div style={helpInstructionsParagraphWrapperStyle}>
                            <p style={helpTextStyle}>
                                4. The case and number you need to inflect the
                                word into.
                            </p>
                            <p style={helpTextStyle}>
                                5. Enter your answer here and press Enter to
                                submit it.
                            </p>
                        </div>

                        <button
                            style={closeButtonStyle}
                            onClick={() => setShowHelp(false)}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    "#A0826D")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    "#8D6E63")
                            }
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}

            {showGameOver && (
                <div style={helpOverlayStyle}>
                    <div style={gameOverContentStyle}>
                        <h2 style={helpTitleStyle}>Game Over!</h2>
                        <p style={gameOverScoreStyle}>Final Score: {score}</p>
                        <p style={highscoreStyle}>Highscore: {highscore}</p>
                        <p style={correctAnswerStyle}>
                            The correct answer was:{" "}
                            <span style={correctAnswerSpanStyle}>
                                {randomWord.caseValue}
                            </span>
                        </p>
                        <button
                            style={closeButtonStyle}
                            onClick={handleRestart}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    "#A0826D")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    "#8D6E63")
                            }
                        >
                            Restart
                        </button>
                    </div>
                </div>
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

const wordKotusStyle: React.CSSProperties = {
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

const helpOverlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
};

const helpContentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "#3E2723",
    color: "#F5E9DA",
    padding: "32px",
    borderRadius: "12px",
    maxWidth: "700px",
    height: "80%",
    boxShadow:
        "0 8px 24px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1), 0 0 0 12px #8D6E63",
    backgroundImage: `
        linear-gradient(rgba(139, 90, 43, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 90, 43, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: "20px 20px",
};

const helpInstructionsWrapperStyle: React.CSSProperties = {
    display: "flex",
    gap: "24px",
    marginBottom: "-28px",
};

const helpInstructionsParagraphWrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
};

const helpImageStyle: React.CSSProperties = {
    width: "80%",
    height: "80%",
    borderRadius: "8px",
    border: "2px solid #8D6E63",
};

const helpTitleStyle: React.CSSProperties = {
    margin: "0",
    fontSize: "28px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    borderBottom: "2px solid #8D6E63",
    paddingBottom: "12px",
};

const helpTextStyle: React.CSSProperties = {
    fontSize: "16px",
    lineHeight: "1.5",
};

const closeButtonStyle: React.CSSProperties = {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#8D6E63",
    color: "#F5E9DA",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
    fontFamily: "inherit",
    width: "fit-content",
};

const gameOverContentStyle: React.CSSProperties = {
    backgroundColor: "#3E2723",
    color: "#F5E9DA",
    padding: "32px",
    borderRadius: "12px",
    maxWidth: "400px",
    boxShadow:
        "0 8px 24px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1), 0 0 0 12px #8D6E63",
    backgroundImage: `
        linear-gradient(rgba(139, 90, 43, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 90, 43, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: "20px 20px",
    textAlign: "center",
};

const gameOverScoreStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "24px 0",
    color: "#FFD700",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
};

const highscoreStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "16px 0",
    color: "#FFA500",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
};

const correctAnswerStyle: React.CSSProperties = {
    fontSize: "16px",
    margin: "16px 0 24px",
    color: "#90EE90",
    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
    lineHeight: "1.5",
};

const correctAnswerSpanStyle: React.CSSProperties = {
    fontWeight: "bold",
};

export default App;
