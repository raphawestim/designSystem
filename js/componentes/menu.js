function iniciarMenu() {
    montarMenu();

    atualizarMenu();

    adicionarListenerBotoes();
}

function montarMenu() {
    var telaMenu = $('#telaMenu');
    var listaMenu = telaMenu.find('#listaMenu');
    var modeloItemMenu = listaMenu.find('li').clone();

    listaMenu.empty();

    var modulos = estrutura.modulos;
    var contModulos = 0;
    var countLicoes = 0;

    $.each(modulos, function(idModulo, modulo){

        if(!modulo.ignorar) {
            contModulos++;
            var licoes = modulo.licoes;
            countLicoes = 0;

            $.each(licoes, function(idLicao, licao){
                countLicoes++;
                var itemLIcao = modeloItemMenu.clone();
                
                itemLIcao.find('[data-numero-licao]').text(Format(countLicoes));
                itemLIcao.find('[data-titulo-licao]').html(licao.nome);

                itemLIcao.attr('data-sco', idModulo+idLicao);
                itemLIcao.attr('data-tipo', estrutura.modulos[idModulo].licoes[idLicao].tipo+idLicao);

                listaMenu.append(itemLIcao);
            });
        }
    });

    listaMenu.slick({
        dots: false,
        infinite: false,
        appendArrows: $('.nav-slider')
    });

    telaMenu.on('afterChange', function(event, slick, current) {
        var slideAtual = slick.$slides.eq(current);
        slick.$slides.find('.wrap-item').attr('aria-hidden', true);
        slideAtual.find('.wrap-item').attr('aria-hidden', false);
        slideAtual.find('.wrap-item').focus();

        if(slideAtual.hasClass('bloqueado')){
            //add prop disabled botao principal
        }else{
            //remove prop disabled botao principal
        }

        console.log(slideAtual.data('sco'));
    })
}

function atualizarMenu() {
    var telaMenu = $('#telaMenu');
    var listaMenu = telaMenu.find('#listaMenu');
    var botoesMenu = telaMenu.find('.menu-item');
    var slides = telaMenu.find('.slick-slide');
    
    slides.each(function (i, slide) {
        var scoAtual = $(slide).data('sco');
        
        if(verificaSCOFinalizado(scoAtual)) {
            $(slide).parents('.wrap-item').addClass('finalizado');
            $(slide).removeClass('bloqueado');
        }else{
            $(slide).addClass('bloqueado');
        }
    });
    
    listaMenu.find('.bloqueado').first().removeClass('bloqueado').prop('disabled', false);

    var indexUltimoItemLiberado = slides.not('.bloqueado').last().index('.slick-slide');


    //Ir para o slide da próxima lição
    if(indexUltimoItemLiberado >= 0){
        setTimeout(function(){
            listaMenu.slick('slickGoTo', indexUltimoItemLiberado);
        }, 400);
    }

    if (isModoDesenvolvimento()) {
        botoesMenu.removeClass('bloqueado').prop('disabled', false);
    }
}

function adicionarListenerBotoes() {
    var telaMenu = $('#telaMenu');

    telaMenu.on('click', '.menu-item', function(){

        var scoClique = $(this).data('sco');
        var tipoLicao = $(this).data('tipo');
        
        if(tipoLicao == 'video'){
            abrirModalVideoMenu(scoClique);
        }else{
            ChangeSCO(scoClique);
        }
        
    });
}
