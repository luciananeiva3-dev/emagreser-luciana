/* ============================================================
   CONFIGURAÇÃO DO KIT EMAGRESER
   Este é o único arquivo de configuração. São três valores, todos entre aspas
   (o terceiro é true ou false, sem aspas).

   Enquanto os valores estiverem vazios e o interruptor em false, o kit funciona
   como sempre: o que a cliente escreve fica guardado no navegador dela, e o
   botão Enviar para a Luciana segue valendo.

   Para ligar o salvamento no servidor, preencha os três valores abaixo.
   Não use o sinal de apóstrofo (') dentro dos valores.
   ============================================================ */
window.KIT_CONFIG={

  /* 1. Endereço do projeto.
     No Supabase (supabase.com), abra o seu projeto e clique em Settings (o ícone
     de engrenagem), depois em API. Procure o campo Project URL e copie o endereço
     inteiro. Ele começa com https:// e termina em .supabase.co
     Exemplo: 'https://abcdefghij.supabase.co' */
  enderecoDoProjeto:'',

  /* 2. Chave pública.
     Na mesma tela (Settings, depois API), procure a chave chamada anon public
     (ou publishable key). É um texto muito comprido. Copie e cole aqui.
     Esta chave pode ficar visível no site: ela sozinha não abre nenhuma ficha.
     ATENÇÃO: nunca cole aqui a chave chamada service_role (ou secret). Essa é
     secreta e dá acesso a tudo. */
  chavePublica:'',

  /* 3. Interruptor.
     Troque false por true para ligar o salvamento no servidor.
     Com false, o kit funciona só no navegador, mesmo que os dois valores
     acima estejam preenchidos. Serve para desligar rápido, se precisar. */
  ligado:false

};
