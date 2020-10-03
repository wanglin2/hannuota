<template>
  <div id="app">
    <div class="titleBox">
      <div class="title">汉诺塔小游戏</div>
      <div class="subTitle">Tower of Hanoi</div>
    </div>
    <Game></Game>
  </div>
</template>

<script>
import Game from './components/Game';

export default {
  name: 'App',
  components: {
    Game
  }
}
</script>

<style lang="less" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

  .titleBox {
    position: absolute;
    left: 0;
    right: 0;
    top: 5%;
    text-align: center;
    font-family: "Segoe UI", "Lucida Grande", Helvetica, Arial, "Microsoft YaHei", FreeSans, Arimo, "Droid Sans", "wenquanyi micro hei", "Hiragino Sans GB", "Hiragino Sans GB W3", "FontAwesome", sans-serif;

    .title {
      font-size: 35px;
      font-weight: 600;
    }

    .subTitle {
      font-size: 25px;
      font-weight: 400;
      color: #c3c8cd;
    }
  }
  
}
</style>
