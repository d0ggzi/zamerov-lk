import {cellText, smallCellBlock} from "./styles.js";

export default function Service({service}) {
    return (
        <div className={smallCellBlock}>
            <p className={cellText}>{service?.name}</p>
        </div>
    );
}