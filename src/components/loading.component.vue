<script>
export default {
  name: "loading",
  props: {
    msg:{
      type: String,
      default: "Cargando..."
    }
  }
}
</script>

<template>
  <Card>
    <template #content>
      <div class="flex col center margin-1 gap-0-5">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8"/>
        <div>{{msg}}</div>
      </div>
    </template>
  </Card>
</template>