import "@testing-library/jest-dom/vitest";
import {afterEach} from "vitest";
import {cleanup} from "@testing-library/react";

// Размонтируем дерево и сбрасываем моки после каждого теста, чтобы они не влияли друг на друга.
afterEach(() => {
    cleanup();
});
