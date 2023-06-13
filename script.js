function validaData() {
    var dataConsulta = document.getElementById('data').value;
    var dataFormatada = dataConsulta.split('-').join('/');
    var dataInicial = '1984/12/01';
    if (dataFormatada < dataInicial){
        alert("Cálculo disponíveis a partir de 01/12/1984. Informe uma nova data");
        stop} else {
            return dataConsulta;
        }
    }

function formatarURL(dia) {
    var data = validaData();
    if (data.slice(5,7) == '01') {
        var mes = 12;
        ano = data.slice(0,4) - 1;
    } else {
        if (data.slice(5,7) < 11){
            mes = "0" + String(data.slice(5,7) - 1);
        } else {
            mes = data.slice(5,7) -1;
        }
        ano = data.slice(0,4);
    }
    var dataURL= mes+"-"+dia+"-"+ano;
    var url = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='"+dataURL+"'&$top=100&$format=json"    
    return url;
}

function conversao() {
    var dia = 15
    var url = formatarURL(dia);
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
        var resposta = JSON.parse(request.responseText);
        var valores = resposta.value[0];
        var data = valores.dataHoraCotacao;
        var cotacao = valores.cotacaoCompra;
        var valor = document.getElementById('valor').value;
        var conversao = cotacao * valor;
        var mensagem = "<p>Cotação do dia " + data.slice(8,10) + "/" + data.slice(5,7) + "/" + data.slice(0,4) + ": R$ " + cotacao + "<br>Cálculo: US$ " + valor + " * " + cotacao + " = R$ " + conversao.toFixed(2) + "<br><br><h4> O valor a ser informado no carnê-leão é R$ " + conversao.toFixed(2) + "</h4>";
        document.getElementById("resultado").innerHTML=mensagem;
    }
    var valores = request.send();
    console.log(valores)
}