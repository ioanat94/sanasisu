import { Word, cases, wordlist } from "./wordlist";
import { describe, expect, it } from "vitest";

describe("wordlist.ts", () => {
    describe("cases", () => {
        it("should contain all 25 Finnish cases", () => {
            const expectedCases = [
                "nom_p",
                "gen_s",
                "gen_p",
                "par_s",
                "par_p",
                "ine_s",
                "ine_p",
                "ela_s",
                "ela_p",
                "ill_s",
                "ill_p",
                "ade_s",
                "ade_p",
                "abl_s",
                "abl_p",
                "all_s",
                "all_p",
                "ess_s",
                "ess_p",
                "tra_s",
                "tra_p",
                "abe_s",
                "abe_p",
                "ins_p",
                "com_p",
            ];

            expect(Object.keys(cases)).toHaveLength(25);
            expectedCases.forEach((caseKey) => {
                expect(cases).toHaveProperty(caseKey);
                expect(typeof cases[caseKey]).toBe("string");
            });
        });

        it("should have descriptive names for each case", () => {
            expect(cases.nom_p).toBe("nominative plural");
            expect(cases.gen_s).toBe("genitive singular");
            expect(cases.par_s).toBe("partitive singular");
            expect(cases.ine_s).toBe("inessive singular (-ssA)");
            expect(cases.ela_s).toBe("elative singular (-stA)");
            expect(cases.ill_s).toBe("illative singular (-hVn)");
        });
    });

    describe("wordlist", () => {
        it("should be an array", () => {
            expect(Array.isArray(wordlist)).toBe(true);
        });

        it("should contain at least some words", () => {
            expect(wordlist.length).toBeGreaterThan(0);
        });

        it("should have words with all required properties", () => {
            const requiredProps: (keyof Word)[] = [
                "word",
                "tr",
                "kotous",
                "nom_p",
                "gen_s",
                "gen_p",
                "par_s",
                "par_p",
                "ine_s",
                "ine_p",
                "ela_s",
                "ela_p",
                "ill_s",
                "ill_p",
                "ade_s",
                "ade_p",
                "abl_s",
                "abl_p",
                "all_s",
                "all_p",
                "ess_s",
                "ess_p",
                "tra_s",
                "tra_p",
                "abe_s",
                "abe_p",
                "ins_p",
                "com_p",
            ];

            wordlist.forEach((word) => {
                requiredProps.forEach((prop) => {
                    expect(word).toHaveProperty(prop);
                    expect(typeof word[prop]).toBe("string");
                });
            });
        });

        it("should have valid structure for koira (dog)", () => {
            const koira = wordlist.find((w) => w.word === "koira");

            expect(koira).toBeDefined();
            expect(koira?.tr).toBe("dog");
            expect(koira?.kotous).toBe("koira");
            expect(koira?.nom_p).toBe("koirat");
            expect(koira?.gen_s).toBe("koiran");
            expect(koira?.par_s).toBe("koiraa");
            expect(koira?.ine_s).toBe("koirassa");
        });

        it("should have valid structure for luu (bone)", () => {
            const luu = wordlist.find((w) => w.word === "luu");

            expect(luu).toBeDefined();
            expect(luu?.tr).toBe("bone");
            expect(luu?.kotous).toBe("maa");
            expect(luu?.nom_p).toBe("luut");
            expect(luu?.gen_s).toBe("luun");
            expect(luu?.par_s).toBe("luuta");
        });

        it("should have a reasonable number of words", () => {
            expect(wordlist.length).toBeGreaterThan(1000);
            expect(wordlist.length).toBeLessThan(10000);
        });

        it("should have non-empty strings for all properties", () => {
            wordlist.forEach((word) => {
                Object.entries(word).forEach(([, value]) => {
                    expect(value.trim().length).toBeGreaterThan(0);
                });
            });
        });

        it("should have valid English translations", () => {
            wordlist.forEach((word) => {
                expect(word.tr.length).toBeGreaterThan(0);
                expect(word.tr).toMatch(/^[a-zA-Z\u00C0-\u017F\s\-,.'()&/]+$/);
            });
        });

        it("should have valid kotous (declension type)", () => {
            wordlist.forEach((word) => {
                expect(word.kotous.length).toBeGreaterThan(0);
            });
        });
    });
});
