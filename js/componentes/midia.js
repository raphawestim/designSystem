var compMidiaInicializado = false;
var playerIds = [];

function iniciarMidia(isStreaming, caminhoStreaming) {
    var $compMidia = $('#areaConteudo').find('[data-midia]');
    var totalCompMidia = $compMidia.length;
    var quantCompMidiaIniciados = 0;

    playerIds = [];
    compMidiaInicializado = false;

    if (totalCompMidia) {
        $compMidia.each(function (index) {
            var playerSrc = $(this).data('src');
            var playerPoster = $(this).data('poster');
            var playerTitle = $(this).data('title');
            var playerDescription = $(this).data('description');
            var playerCaptions = $(this).data('captions');
            var playerId = 'playerMidia-' + index;
            
            const $wrapVideoModal = $(this).parents('[data-video-modal]');
            const $btVideoModal = $wrapVideoModal.find('[data-play-video]');
            
            $(this).attr('id', playerId);
            playerIds.push(playerId);
        
            var jwplayerSetup = getJwplayerSetupObj(playerSrc, playerPoster, playerTitle, playerDescription, isStreaming, caminhoStreaming, playerCaptions);

            if($wrapVideoModal){
                totalCompMidia = totalCompMidia - 1;

                $btVideoModal.on('click', function(){
                    $.featherlight('<div class="area-video midia-wrapper midia-video"><div id="video_container"></div></div>', {
                        variant: 'limite-video',
                        closeOnClick: false,
                        afterContent: function(){
                            $('#'+playerId).appendTo($('#video_container'));
                        },
                        beforeClose: function(){
                            $('#'+playerId).appendTo($wrapVideoModal);
                            stopAllPlayers();
                        }
                    });
                });
            }
            jwplayer(playerId).setup(jwplayerSetup);
            
            jwplayer(playerId).on('ready', function (p1, p2) {
                console.log('ready');
                quantCompMidiaIniciados++;

                verificaQuantMidiaIniciadas(totalCompMidia, quantCompMidiaIniciados);

                $('#' + this.id).attr('tabindex', '-1');
                $('#' + this.id).find('[tabindex]').attr('tabindex', '-1');
                $('#' + this.id).find('.jw-text').attr('aria-hidden', true);
            });

            jwplayer(playerId).on('play', function (e) {
                $('#' + this.id).attr('tabindex', '-1');
                $('#' + this.id).find('[tabindex]').attr('tabindex', '-1');
            });

            jwplayer(playerId).on('error', function (e) {
                console.log('Erro jwplayer:', e.message);
            });

            /* Setup para formatar a legenda */
            // jwplayer().setCaptions({
            //     backgroundColor: "#333",
            //     backgroundOpacity: 70,
            //     color: "#fff",
            //     edgeStyle: "raised",
            //     fontSize: 14,
            // });
        });

        agrupaCompMidia(playerIds);
        verificaQuantMidiaIniciadas(totalCompMidia, quantCompMidiaIniciados);

        ativarBotoesTranscricao();
    }

    controleMidia();
}

function agrupaCompMidia(p_arrPlayerIds) {
    playerIds = p_arrPlayerIds;
    $.each(playerIds, function (index, id) {
        jwplayer(id).on('play', function () {
            $.each(playerIds, function (x, pid) {
                if (id === pid) {
                    return true;
                }

                jwplayer(pid).stop();
            });
        });
    });
}

function stopAllPlayers() {
    $.each(playerIds, function (index, id) {
        jwplayer(id).stop();
    });
}

function verificaQuantMidiaIniciadas(total, iniciados) {
    if (total == iniciados) {
        compMidiaInicializado = true;
    }
}

function controleMidia() {
    var playerIds = [];
    var compMidiaVisitados = [];
    var verificaInicializacao;

    if ($('#areaConteudo').find('[data-midia]').length || $('#areaConteudo').find('.jwplayer').length) {

        verificaInicializacao = setInterval(function () {
            if (compMidiaInicializado) {
                verMidiaFinalizado();
            }
        }, 500);
    } else {
        $('body').trigger('interacoesConcluidas', {
            interacaoExistente: false
        });
    }

    function verMidiaFinalizado() {
        clearInterval(verificaInicializacao);

        if ($('#areaConteudo').find('.jwplayer').length) {
            $('#areaConteudo').find('.jwplayer').each(function (index) {
                var playerId = $(this).attr('id');
                var $playerIndex = Number($(this).attr('id').split('playerMidia-')[1]);

                compMidiaVisitados[index] = 0;

                playerIds.push(playerId);

                jwplayer(playerId).on('complete', function () {
                    console.log('complete')
                    compMidiaVisitados[$playerIndex] = 1;

                    // if (String(compMidiaVisitados).indexOf(0) == -1) {
                        var indexBlocoAtual = $('#' + playerId).parents('[data-bloco]').index('[data-bloco]');

                        $('body').trigger('interacoesConcluidas', {
                            interacaoExistente: true,
                            indexBloco: indexBlocoAtual
                        });
                    // }

                    if($('wrapperPagina').attr('data-tipo-licao') == 'podcast') {
                        finalizarTela();
                    }
                });
            });
        }
    }
}

function getJwplayerSetupObj(playerSrc, playerPoster, playerTitle, playerDescription, isStreaming, caminhoStreaming, playerCaptions) {
    var jwplayerSetupObj = {
        width: '100%',
        skin: {
            name: 'custom'
        }
    };

    if(playerSrc.indexOf('.mp3') > 0) {
        jwplayerSetupObj['height'] = 200;
        jwplayerSetupObj['title'] = playerTitle;
        jwplayerSetupObj['description'] = playerDescription;
    } else {
        jwplayerSetupObj['aspectratio'] = '16:9';
        jwplayerSetupObj['image'] = estrutura.caminhoMidiaLocal + playerPoster;
    }

    if (playerSrc.indexOf('.mp4') > 0 && isStreaming) {
        jwplayerSetupObj['file'] = caminhoStreaming + playerSrc + '/playlist.m3u8';

        if(playerCaptions){
            jwplayerSetupObj['tracks'] = [
                {
                  kind: "captions",
                  file: caminhoStreaming + playerCaptions,
                  label: "PT-BR",
                },
            ]
        }
    } else {
        jwplayerSetupObj['file'] = estrutura.caminhoMidiaLocal + playerSrc;
        if(playerCaptions){
            jwplayerSetupObj['tracks'] = [
                {
                  kind: "captions",
                  file: estrutura.caminhoMidiaLocal + playerCaptions,
                  label: "PT-BR",
                },
            ]
        }
    }

    jwplayerSetupObj['height'] = 40;

    return jwplayerSetupObj;
}

function ativarBotoesTranscricao() {
    $('[data-transcricao]').each(function(index, transcricao) {
        $transcricao = $(transcricao);
        $botaoTranscricao = $transcricao.parent().find('[data-botao-transcricao]');

        idTranscricao = 'transcricao' + index;

        $transcricao.children().eq(0).attr('id', idTranscricao);
        $botaoTranscricao.attr('data-transcricao-id', '#' + idTranscricao);
    });

    $('[data-botao-transcricao]').on('click', function(e){
        var modalTranscricao = {
            url: '',
            modalId: $(this).attr('data-transcricao-id')
        };

        abreModal(modalTranscricao);

        var indexBlocoAtual = $(this).parents('[data-bloco]').index('[data-bloco]');

        $('body').trigger('interacoesConcluidas', {
            interacaoExistente: true,
            indexBloco: indexBlocoAtual
        });
    });
}
