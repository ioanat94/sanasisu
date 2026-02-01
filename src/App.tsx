import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { Word, wordlist } from "./utils/wordlist";
import { useRef, useState } from "react";

import { Game } from "./game/scenes/Game";
import { MainMenu } from "./game/scenes/MainMenu";

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

    const changeScene = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene) {
                scene.changeScene();
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

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            {currentSceneKey === "Game" && (
                <>
                    <form
                        style={{
                            position: "absolute",
                            top: 20,
                            left: 20,
                            zIndex: 10,
                            pointerEvents: "auto",
                        }}
                        onSubmit={(e) => {
                            e.preventDefault();

                            if (playerAnswer === randomWord.caseValue) {
                                const newRandomWord = getRandomWord();
                                setRandomWord(newRandomWord);
                                setPlayerAnswer("");
                                callEnemyTakeDamage();
                                setScore(score + 1);
                            } else {
                                callLancelotTakeDamage();
                            }
                        }}
                    >
                        <p>Score: {score}</p>
                        <p>
                            {randomWord.word} | {randomWord.tr}
                        </p>
                        <p>{randomWord.kotous}</p>
                        <p>{getFullCaseName(randomWord.case)}</p>
                        <input
                            type="text"
                            placeholder="Enter text..."
                            style={{ padding: "8px", fontSize: "16px" }}
                            value={playerAnswer}
                            onChange={(e) => setPlayerAnswer(e.target.value)}
                        />
                    </form>
                </>
            )}

            <div>
                <div>
                    <button className="button" onClick={changeScene}>
                        Change Scene
                    </button>
                </div>
            </div>
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
    const cases = {
        nom_p: "nominative plural",
        gen_s: "genitive singular",
        gen_p: "genitive plural",
        par_s: "partitive singular",
        par_p: "partitive plural",
        ine_s: "inessive singular (-ssA)",
        ine_p: "inessive plural (-ssA)",
        ela_s: "elative singular (-stA)",
        ela_p: "elative plural (-stA)",
        ill_s: "illative singular (-hVn)",
        ill_p: "illative plural (-hVn)",
        ade_s: "adessive singular (-llA)",
        ade_p: "adessive plural (-llA)",
        abl_s: "ablative singular (-ltA)",
        abl_p: "ablative plural (-ltA)",
        all_s: "allative singular (-lle)",
        all_p: "allative plural (-lle)",
        ess_s: "essive singular (-nA)",
        ess_p: "essive plural (-nA)",
        tra_s: "translative singular (-ksi)",
        tra_p: "translative plural (-ksi)",
        abe_s: "abessive singular (-ttA)",
        abe_p: "abessive plural (-ttA)",
        ins_p: "instructive plural (-in)",
        com_p: "comitative plural (-ne)",
    } as { [key: string]: string };

    return cases[caseKey] || caseKey;
}

export default App;
