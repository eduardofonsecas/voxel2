// ===== DADOS =====
// Lê do navegador o que foi salvo antes. Se não tiver nada, começa com valores padrão.
let tarefas = JSON.parse(localStorage.getItem('voxelTarefas')) || [];
let colaboradores = JSON.parse(localStorage.getItem('voxelColaboradores')) || ['Ana', 'Bruno'];

// ===== ELEMENTOS DA PÁGINA =====
const btnInicio = document.querySelector('#btnInicio');
const btnGestor = document.querySelector('#btnGestor');
const btnColaborador = document.querySelector('#btnColaborador');

const telaInicio = document.querySelector('#telaInicio');
const telaGestor = document.querySelector('#telaGestor');
const telaColaborador = document.querySelector('#telaColaborador');

const inputTarefa = document.querySelector('#tarefa');
const selectResponsavel = document.querySelector('#selectResponsavel');
const inputHorario = document.querySelector('#horario');
const addButton = document.querySelector('#addButton');

const inputNovoColaborador = document.querySelector('#novoColaborador');
const addColaborador = document.querySelector('#addColaborador');

const resumoGestor = document.querySelector('#resumoGestor');
const listaGestor = document.querySelector('#listaGestor');

const selectColaborador = document.querySelector('#selectColaborador');
const resumoColaborador = document.querySelector('#resumoColaborador');
const listaColaborador = document.querySelector('#listaColaborador');

// ===== TROCAR DE TELA =====
function mostrarTela(tela) {
    telaInicio.classList.add('escondida');
    telaGestor.classList.add('escondida');
    telaColaborador.classList.add('escondida');

    tela.classList.remove('escondida');
}

btnInicio.addEventListener('click', () => mostrarTela(telaInicio));

btnGestor.addEventListener('click', () => {
    atualizarTudo();
    mostrarTela(telaGestor);
});

btnColaborador.addEventListener('click', () => {
    atualizarTudo();
    mostrarTela(telaColaborador);
});

// ===== SALVAR =====
function salvar() {
    localStorage.setItem('voxelTarefas', JSON.stringify(tarefas));
    localStorage.setItem('voxelColaboradores', JSON.stringify(colaboradores));
}

// ===== HORA E ATRASO =====
// Devolve a hora atual no formato "14:30"
function horaAtual() {
    let agora = new Date();
    let hora = String(agora.getHours()).padStart(2, '0');
    let minuto = String(agora.getMinutes()).padStart(2, '0');
    return hora + ':' + minuto;
}

// A tarefa está atrasada se não foi feita e já passou do horário
function estaAtrasada(tarefa) {
    return !tarefa.done && horaAtual() > tarefa.horario;
}

// ===== COLABORADORES =====
function addNovoColaborador() {
    let nome = inputNovoColaborador.value.trim();

    if (nome == '') {
        alert('Digite o nome do colaborador');
        return;
    }
    if (colaboradores.includes(nome)) {
        alert('Esse colaborador já existe');
        return;
    }

    colaboradores.push(nome);
    inputNovoColaborador.value = '';
    salvar();
    atualizarTudo();
}

addColaborador.addEventListener('click', addNovoColaborador);

inputNovoColaborador.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') addNovoColaborador();
});

// Coloca os nomes dentro de um <select>, mantendo o nome que já estava escolhido
function preencherSelect(select) {
    let escolhido = select.value;
    select.innerHTML = '';

    colaboradores.forEach((nome) => {
        let opcao = document.createElement('option');
        opcao.value = nome;
        opcao.textContent = nome;
        select.appendChild(opcao);
    });

    if (colaboradores.includes(escolhido)) {
        select.value = escolhido;
    }
}

// ===== ADICIONAR TAREFA (gestor) =====
function addItem() {
    if (inputTarefa.value.trim() == '') {
        alert('Não é possivel adicionar tarefa');
        return;
    }
    if (colaboradores.length == 0) {
        alert('Cadastre um colaborador primeiro');
        return;
    }
    if (inputHorario.value == '') {
        alert('Escolha o horário limite');
        return;
    }

    tarefas.push({
        name: inputTarefa.value.trim(),
        responsavel: selectResponsavel.value,
        horario: inputHorario.value,
        done: false
    });

    inputTarefa.value = '';
    salvar();
    montarListas();
}

addButton.addEventListener('click', addItem);

inputTarefa.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') addItem();
});

// ===== MONTAR UMA TAREFA NA TELA =====
// podeMarcar = true  -> colaborador (pode marcar como feita)
// podeMarcar = false -> gestor (só vê e pode apagar)
function montarHTML(tarefa, index, podeMarcar) {
    let li = document.createElement('li');

    let divItemList = document.createElement('div');
    divItemList.classList.add('itemList');

    // caixinha de marcar
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarefa.done;
    checkbox.disabled = !podeMarcar;
    checkbox.addEventListener('change', () => {
        tarefas[index].done = checkbox.checked;
        salvar();
        montarListas();
    });

    // texto da tarefa
    let span = document.createElement('span');
    let texto = tarefa.name + ' (até ' + tarefa.horario + ')';
    if (!podeMarcar) {
        texto = tarefa.name + ' - ' + tarefa.responsavel + ' (até ' + tarefa.horario + ')';
    }
    if (estaAtrasada(tarefa)) {
        texto = texto + ' - ATRASADA';
        span.classList.add('atrasada');
    }
    if (tarefa.done) {
        span.classList.add('tracado');
    }
    span.textContent = texto;

    divItemList.appendChild(checkbox);
    divItemList.appendChild(span);

    // lixeira (só para o gestor)
    if (!podeMarcar) {
        let lixeira = document.createElement('div');
        lixeira.classList.add('acao');
        lixeira.textContent = '🗑️';
        lixeira.addEventListener('click', () => {
            tarefas.splice(index, 1);
            salvar();
            montarListas();
        });
        divItemList.appendChild(lixeira);
    }

    li.appendChild(divItemList);
    return li;
}

// ===== MONTAR AS LISTAS =====
function montarListas() {
    // --- lista do gestor: todas as tarefas ---
    listaGestor.innerHTML = '';
    let feitasGestor = 0;

    tarefas.forEach((tarefa, index) => {
        listaGestor.appendChild(montarHTML(tarefa, index, false));
        if (tarefa.done) feitasGestor++;
    });
    resumoGestor.textContent = feitasGestor + ' de ' + tarefas.length + ' tarefas concluídas';

    // --- lista do colaborador: só as tarefas dele ---
    listaColaborador.innerHTML = '';
    let total = 0;
    let feitas = 0;

    tarefas.forEach((tarefa, index) => {
        if (tarefa.responsavel == selectColaborador.value) {
            listaColaborador.appendChild(montarHTML(tarefa, index, true));
            total++;
            if (tarefa.done) feitas++;
        }
    });
    resumoColaborador.textContent = feitas + ' de ' + total + ' tarefas concluídas';
}

// Atualiza os selects e as listas
function atualizarTudo() {
    preencherSelect(selectResponsavel);
    preencherSelect(selectColaborador);
    montarListas();
}

// Quando o colaborador troca de nome, mostra as tarefas dele
selectColaborador.addEventListener('change', montarListas);

// A cada 1 minuto confere de novo quais tarefas ficaram atrasadas
setInterval(montarListas, 60000);

// ===== INÍCIO =====
atualizarTudo();
mostrarTela(telaInicio);