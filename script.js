function menu() {
    const nav = document.getElementById("menu");
    const menuOptions = `
    <div>
        <a href="javascript:void(0);" onclick="openMenu()"><img src="img/menu.png" height="70px"></a>
        <div id="menuList" class="menuList">
            <a href="/index.html">Página Inicial |</a>
            <a href="/servicos.html">Serviços |</a>
            <a href="/exterior.html">Carnê-Leão |</a>
            <a href="/contato.html">Contato</a>
        </div>
    </div>
    <a href="index.html"><img src="img/logo.png" height="70px"></a>`;
    nav.innerHTML = menuOptions;
}

function openMenu() {
    var menuList = document.getElementById("menuList");
    if (menuList.style.display == "inline-block") {
        menuList.style.display = "none";
    } else {
        menuList.style.display = "inline-block";
    }
}

function enviarMensagem() {
    var nome = document.getElementById("name").value;
    var email = document.getElementById("mail").value;
    var telefone = document.getElementById("phone").value;
    var mensagem = document.getElementById("text").value;
    var url = "https://docs.google.com/forms/d/e/1FAIpQLSfrf0TaazJgTodQRRGal3eMcd7ayu0GCZ3Rv0EqXHV7q4tv-w/formResponse?usp=pp_url&entry.67874163=" + nome + "&entry.1400403783=" + email + ".com&entry.1560617271=" + telefone + "&entry.2146183886=" + mensagem;
    var win = window.open(url, '_blank');
}


async function converter() {
    var data = document.getElementById("data").value;
    var moeda = document.getElementById("moeda").value;
    var valor = parseFloat(document.getElementById("valor").value);
    var dia = data.substr(8, 2);
    var mes = data.substr(5, 2);
    var ano = data.substr(0, 4);

    if (!data || ano < 2020) {
        //erro de data vazia ou anterior a 2020
        mostrarMensagem("<p>Data incorreta</p>");
        return
    }
    if (isNaN(valor) || valor < 0) {
        // erro valor vazio ou negativo
        mostrarMensagem("Valor incorreto");
        return;
    }

    if (moeda == "EURO") {
        const valorConvertido = await converterEuroParaDolar(dia, mes, ano, valor);
        console.log(valorConvertido)
        valor = valorConvertido;
    }

    if (data.substr(5, 2) == 1) {
        // se mês é igual a janeiro, buscar cotacao de dezembro do ano anterior
        dia = 15;
        var mes = 12;
        var ano = data.substr(0, 4) - 1;
    } else {
        // outros meses, buscar cotacao do mes anterior
        dia = 15;
        var mes = data.substr(5, 2) - 1;
        var ano = data.substr(0, 4);
    }

    while (dia > 0) {
        var url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${mes}-${dia}-${ano}'&$top=100&$format=json`;
        try {
            const json = await getJson(url);
            const dados = json.value;
            if (dados.length > 0) {
                const cotacaoCompra = dados[0].cotacaoCompra;
                const dataHoraCotacao = new Date(dados[0].dataHoraCotacao);
                const valorConvertido = valor * cotacaoCompra;
                mostrarMensagem(`<p>Data da cotação: ${dataHoraCotacao.toLocaleString("pt-br")}</p>
                <p>Cotação do dólar = R$ ${cotacaoCompra.toFixed(4).replace('.', ',')}</p>
                <h3>Valor em reais = R$ ${valorConvertido.toFixed(2).replace('.', ',')}</h3>
                <br><br>
                <p>Fonte da cotação: Banco Central</p>`);
                return;
            } else {
                dia--;
            }
        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
            return;
        }
    }
    mostrarMensagem("<p>Não foi possível encontrar uma cotação válida</p>");
}

async function getJson(url) {
    const request = new Request(url);
    const response = await fetch(request);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

function mostrarMensagem(mensagem) {
    var div = document.getElementById("dados-conversao");
    div.innerHTML = mensagem
}

async function converterEuroParaDolar(dia, mes, ano, valor) {
    while (dia > 0) {
        var url = `https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?startPeriod=${ano}-${mes}-${dia}&endPeriod=${ano}-${mes}-${dia}&format=jsondata&detail=dataonly`;
        try {
            const json = await getJson(url);
            const dadosValor = json.dataSets;
            const dolar = dadosValor[0].series["0:0:0:0:0"].observations["0"][0];
            const dadosData = json.structure;
            const data = dadosData.dimensions.observation[0].values[0].id;
            const valorConvertido = valor * dolar;
            console.log("Data", data);
            console.log("Dolar:", dolar.toFixed(4).replace('.', ','));
            console.log("Valor convertido: US$", valorConvertido.toFixed(2).replace('.', ','))
            return valorConvertido
        } catch (error) {
            dia--;
            if (dia < 10) {
                if (dia == 0) {
                    dia = 31;
                    mes--;
                    if (mes < 10) {
                        mes = "0" + mes;
                    }
                } else {
                    dia = "0" + dia;
                }
            }
        }
    }
}