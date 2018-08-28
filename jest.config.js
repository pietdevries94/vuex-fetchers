module.exports = {
    "transform": {
        "^.+\\.ts?$": "ts-jest"
    },
    "testRegex": "./test/.*.spec.ts$",
    "moduleFileExtensions": [
        "ts",
        "js",
        "json",
        "node"
    ],
    "moduleNameMapper": {
        "src/(.*)": "<rootDir>/src/$1"
    },
    "testURL": "https://www.somthing.com/test.html"
}
