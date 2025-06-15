import {createGlobalStyle} from "styled-components";
import involveRegular from '/assets/fonts/Involve-Regular.otf'
import involveSemiBold from '/assets/fonts/Involve-SemiBold.otf'
import involveBold from '/assets/fonts/Involve-Bold.otf'
import "tailwindcss";

export const GlobalStyle = createGlobalStyle`
    html {
        height: 100%;
    }

    * {
        padding: 0;
        margin: 0;
    }

    body,
    html {
        display: flex;
        flex-direction: column;
        height: 100%;
        margin: 0;
    }

    div#root {
        display: flex;
        flex-direction: column;
        min-height: 100%
    }

    body {
        position: relative;
        min-height: 100%;
        font-family: ${(props) => props.theme.fontFamily};
        font-size: ${(props) => props.theme.fontSizeDefault};
        line-height: 150%;
        font-weight: 400;
        color: ${(props) => props.theme.fontColorBlack};
    }

    @font-face {
        font-family: 'Involve';
        src: url(${involveRegular}) format('opentype'),
        url(${involveSemiBold}) format('opentype'),
        url(${involveBold}) format('opentype')
    }
`;