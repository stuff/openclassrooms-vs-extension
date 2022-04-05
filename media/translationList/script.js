/* global acquireVsCodeApi, window, document, Handlebars */

(function () {
    const rootElement = document.getElementById('root');
    let translations = null;

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'updateList': {
                translations = event.data.translations;
                updateList();
                break;
            }
        }
    });

    const html = `
        <input id="queryfilter" />
        <table>
            <tbody id="listbody">
            </tbody>
        </table>
    `;

    const elements = createSkeleton(rootElement, html);

    elements.queryfilter.addEventListener('keyup', (e) => {
        // if (e.target.value.length >= 3) {
        updateList(e.target.value.length >= 3 ? e.target.value : null);
        // } else {
        //     updateList();
        // }
    });

    /* ************************************************************************************ */

    function stringDecorate(str, reg) {
        return str.replace(
            reg,
            '<span style="background: rgba(230, 190, 70, 0.3)">$1</span>'
        );
    }

    function updateList(queryFilterValue) {
        let list = '';
        const reg = queryFilterValue
            ? new RegExp(`(${queryFilterValue})`)
            : null;

        translations.forEach(({ key, value }) => {
            if (reg) {
                if (
                    key.toLowerCase().match(reg) ||
                    value.toLowerCase().match(reg)
                ) {
                    list += stringDecorate(`<tr><td>${key}</td></tr>`, reg);
                }
            } else {
                list += `<tr><td>${key}</td></tr>`;
            }
        });

        updateElement(elements.listbody, list);
    }

    /* ************************************************************************************ */

    function createSkeleton(rootElement, html) {
        rootElement.innerHTML = html;
        const elements = {};

        for (let element of rootElement.querySelectorAll('[id]')) {
            elements[element.id] = element;
        }

        return elements;
    }

    function updateElement(element, html) {
        element.innerHTML = html;
    }
})();
