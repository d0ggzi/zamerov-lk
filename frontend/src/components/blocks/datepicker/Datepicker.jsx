import {createTheme, Datepicker} from "flowbite-react";

export function DatePicker({ date, setDate }) {
    const customTheme = createTheme({
        "root": {
            "base": "relative"
        },
        "popup": {
            "root": {
                "base": "absolute top-10 z-50 block pt-2",
                "inline": "relative top-0 z-auto",
                "inner": "inline-block rounded-lg bg-gray-800 p-4 shadow-lg"
            },
            "header": {
                "base": "",
                "title": "px-2 py-3 text-center font-semibold text-white",
                "selectors": {
                    "base": "mb-2 flex justify-between",
                    "button": {
                        "base": "rounded-lg px-5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-200 bg-gray-700 text-white hover:bg-gray-600",
                        "prev": "",
                        "next": "",
                        "view": ""
                    }
                }
            },
            "view": {
                "base": "p-1"
            },
            "footer": {
                "base": "mt-2 flex space-x-2",
                "button": {
                    "base": "w-full rounded-lg px-5 py-2 text-center text-sm font-medium focus:ring-4 focus:ring-primary-300",
                    "today": "text-white bg-primary-600 hover:bg-primary-700",
                    "clear": "border border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                }
            }
        },
        "views": {
            "days": {
                "header": {
                    "base": "mb-1 grid grid-cols-7",
                    "title": "h-6 text-center text-sm font-medium leading-6 text-gray-400"
                },
                "items": {
                    "base": "grid w-64 grid-cols-7",
                    "item": {
                        "base": "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-white hover:bg-gray-600",
                        "selected": "bg-primary-700 text-white hover:bg-primary-600",
                        "disabled": "text-gray-500"
                    }
                }
            },
            "months": {
                "items": {
                    "base": "grid w-64 grid-cols-4",
                    "item": {
                        "base": "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-white hover:bg-gray-600",
                        "selected": "bg-primary-700 text-white hover:bg-primary-600",
                        "disabled": "text-gray-500"
                    }
                }
            },
            "years": {
                "items": {
                    "base": "grid w-64 grid-cols-4",
                    "item": {
                        "base": "block flex-1 curso r-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-white hover:bg-gray-600",
                        "selected": "bg-primary-700 text-white hover:bg-primary-600",
                        "disabled": "text-gray-500"
                    }
                }
            },
            "decades": {
                "items": {
                    "base": "grid w-64 grid-cols-4",
                    "item": {
                        "base": "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-white hover:bg-gray-600",
                        "selected": "bg-primary-700 text-white hover:bg-primary-600",
                        "disabled": "text-gray-500"
                    }
                }
            }
        }
    })

    return (
        <Datepicker value={date} onChange={setDate} theme={customTheme} className="mb-5" weekStart={1} language="ru-RU" labelTodayButton="Сегодня" labelClearButton="Очистить"/>
    )
}