
document.addEventListener('DOMContentLoaded', () => {
    console.log('App loaded!');

    let configData = {
        general: {},
        monitors: [],
        keybinds: [],
        windowRules: []
    };

    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');
    const fileInput = document.getElementById('file-input');
    const sectionTitle = document.getElementById('section-title');

    console.log('Elements found:', { importBtn, exportBtn, fileInput });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            item.classList.add('active');
            const sectionId = item.dataset.section + '-section';
            document.getElementById(sectionId).classList.add('active');
            sectionTitle.textContent = item.textContent;
        });
    });

    importBtn.addEventListener('click', () => {
        console.log('Import button clicked!');
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        console.log('File input changed!');
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            console.log('File loaded! Content:', event.target.result.substring(0, 200));
            parseConfig(event.target.result);
            renderConfig();
        };
        reader.readAsText(file);
    });

    exportBtn.addEventListener('click', () => {
        const configContent = generateConfig();
        const blob = new Blob([configContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hyprland.conf';
        a.click();
        URL.revokeObjectURL(url);
    });

    function parseConfig(content) {
        console.log('Parsing config...');
        configData = {
            general: {},
            monitors: [],
            keybinds: [],
            windowRules: []
        };

        const lines = content.split('\n');
        let insideBlock = false;
        
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;

            if (line.endsWith('{')) {
                insideBlock = true;
                return;
            }

            if (line === '}') {
                insideBlock = false;
                return;
            }

            if (line.startsWith('monitor=')) {
                const monitor = line.substring('monitor='.length);
                configData.monitors.push(monitor);
            } else if (line.startsWith('bind=')) {
                const bind = line.substring('bind='.length);
                configData.keybinds.push(bind);
            } else if (line.startsWith('windowrule=')) {
                const rule = line.substring('windowrule='.length);
                configData.windowRules.push(rule);
            } else if (line.includes('=')) {
                const [key, value] = line.split('=', 2);
                configData.general[key.trim()] = value.trim();
            }
        });
        console.log('Parsed config data:', configData);
    }

    function renderConfig() {
        renderGeneralSection();
        renderMonitorsSection();
        renderKeybindsSection();
        renderWindowRulesSection();
    }

    function renderGeneralSection() {
        const section = document.getElementById('general-section');
        let html = '<div class="setting-group"><h3>General Settings</h3>';
        
        if (Object.keys(configData.general).length === 0) {
            html += '<p class="setting-desc">Import a config file to see settings here</p>';
        } else {
            for (const [key, value] of Object.entries(configData.general)) {
                html += `
                    <div class="setting-item">
                        <div class="setting-label">${key}</div>
                        <input type="text" class="setting-input" data-key="${key}" value="${value}">
                    </div>
                `;
            }
        }
        
        html += '</div>';
        section.innerHTML = html;
        document.querySelectorAll('#general-section .setting-input').forEach(input => {
            input.addEventListener('input', (e) => {
                configData.general[e.target.dataset.key] = e.target.value;
            });
        });
    }

    function renderMonitorsSection() {
        const list = document.getElementById('monitors-list');
        let html = '';
        configData.monitors.forEach((monitor, index) => {
            html += `
                <div class="setting-item">
                    <input type="text" class="setting-input" data-index="${index}" value="${monitor}" style="flex: 1; margin-right: 12px;">
                    <button class="btn btn-danger btn-sm remove-monitor" data-index="${index}">Remove</button>
                </div>
            `;
        });
        html += `
            <div class="add-btn-container">
                <button class="btn btn-primary" id="add-monitor">Add Monitor</button>
            </div>
        `;
        list.innerHTML = html;
        
        document.querySelectorAll('#monitors-list .setting-input').forEach(input => {
            input.addEventListener('input', (e) => {
                configData.monitors[parseInt(e.target.dataset.index)] = e.target.value;
            });
        });
        
        document.querySelectorAll('#monitors-list .remove-monitor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                configData.monitors.splice(index, 1);
                renderMonitorsSection();
            });
        });
        
        document.getElementById('add-monitor').addEventListener('click', () => {
            configData.monitors.push(',preferred,auto,1');
            renderMonitorsSection();
        });
    }

    function renderKeybindsSection() {
        const list = document.getElementById('keybinds-list');
        let html = '';
        configData.keybinds.forEach((bind, index) => {
            html += `
                <div class="setting-item">
                    <input type="text" class="setting-input" data-index="${index}" value="${bind}" style="flex: 1; margin-right: 12px;">
                    <button class="btn btn-danger btn-sm remove-keybind" data-index="${index}">Remove</button>
                </div>
            `;
        });
        html += `
            <div class="add-btn-container">
                <button class="btn btn-primary" id="add-keybind">Add Keybind</button>
            </div>
        `;
        list.innerHTML = html;
        
        document.querySelectorAll('#keybinds-list .setting-input').forEach(input => {
            input.addEventListener('input', (e) => {
                configData.keybinds[parseInt(e.target.dataset.index)] = e.target.value;
            });
        });
        
        document.querySelectorAll('#keybinds-list .remove-keybind').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                configData.keybinds.splice(index, 1);
                renderKeybindsSection();
            });
        });
        
        document.getElementById('add-keybind').addEventListener('click', () => {
            configData.keybinds.push('SUPER,,exec,');
            renderKeybindsSection();
        });
    }

    function renderWindowRulesSection() {
        const list = document.getElementById('window-rules-list');
        let html = '';
        configData.windowRules.forEach((rule, index) => {
            html += `
                <div class="setting-item">
                    <input type="text" class="setting-input" data-index="${index}" value="${rule}" style="flex: 1; margin-right: 12px;">
                    <button class="btn btn-danger btn-sm remove-rule" data-index="${index}">Remove</button>
                </div>
            `;
        });
        html += `
            <div class="add-btn-container">
                <button class="btn btn-primary" id="add-rule">Add Window Rule</button>
            </div>
        `;
        list.innerHTML = html;
        
        document.querySelectorAll('#window-rules-list .setting-input').forEach(input => {
            input.addEventListener('input', (e) => {
                configData.windowRules[parseInt(e.target.dataset.index)] = e.target.value;
            });
        });
        
        document.querySelectorAll('#window-rules-list .remove-rule').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                configData.windowRules.splice(index, 1);
                renderWindowRulesSection();
            });
        });
        
        document.getElementById('add-rule').addEventListener('click', () => {
            configData.windowRules.push('float,');
            renderWindowRulesSection();
        });
    }

    function generateConfig() {
        let content = '# Generated by Hyprland Configurator\n\n';
        
        if (Object.keys(configData.general).length > 0) {
            content += 'general {\n';
            for (const [key, value] of Object.entries(configData.general)) {
                content += `    ${key}=${value}\n`;
            }
            content += '}\n\n';
        }

        configData.monitors.forEach(monitor => {
            content += `monitor=${monitor}\n`;
        });

        if (configData.monitors.length > 0) content += '\n';

        configData.keybinds.forEach(bind => {
            content += `bind=${bind}\n`;
        });

        if (configData.keybinds.length > 0) content += '\n';

        configData.windowRules.forEach(rule => {
            content += `windowrule=${rule}\n`;
        });

        return content;
    }
});
