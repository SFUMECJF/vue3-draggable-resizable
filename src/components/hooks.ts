import { onMounted, onUnmounted, ref, watch, Ref } from 'vue'

type DragHandleFn = ({ x, y }: { x: number; y: number }) => void

interface Params {
  dragStart?: DragHandleFn
  dragEnd?: DragHandleFn
  dragging?: DragHandleFn
  x?: Ref<number>
  y?: Ref<number>
  autoUpdate?: boolean
  unselect?: () => void
  enable?: Ref<boolean>
}

export function useDraggableContainer(options: Params = {}) {
  const {
    dragStart,
    dragEnd,
    dragging,
    autoUpdate = true,
    unselect,
    enable
  } = options
  let { x = ref(0), y = ref(0) } = options
  let lstX: number = 0
  let lstY: number = 0
  const containerRef = ref<HTMLDivElement>()
  const isDragging = ref(false)
  const _unselect = (e: MouseEvent) => {
    const target = e.target
    if (!containerRef.value?.contains(<Node>target) && unselect) {
      unselect()
    }
  }
  const handleUp = (e: MouseEvent) => {
    isDragging.value = false
    document.documentElement.removeEventListener('mouseup', handleUp)
    document.documentElement.removeEventListener('mousemove', handleDrag)
  }
  const handleDrag = (e: MouseEvent) => {
    if (!(isDragging.value && containerRef.value)) return
    const { pageX, pageY } = e
    const deltaX = pageX - lstX
    const deltaY = pageY - lstY
    x.value = x.value + deltaX
    y.value = y.value + deltaY
    lstX = pageX
    lstY = pageY
    dragging && dragging({ x: x.value, y: y.value })
    if (autoUpdate) {
      containerRef.value.style.left = x + 'px'
      containerRef.value.style.top = y + 'px'
    }
  }
  const handleDown = (e: any) => {
    if (!enable || enable.value) {
      isDragging.value = true
      lstX = e.pageX
      lstY = e.pageY
      document.documentElement.addEventListener('mousemove', handleDrag)
      document.documentElement.addEventListener('mouseup', handleUp)
    }
  }
  watch(isDragging, (cur, pre) => {
    if (!pre && cur) {
      dragStart && dragStart({ x: x.value, y: y.value })
    } else {
      dragEnd && dragEnd({ x: x.value, y: y.value })
    }
  })
  onMounted(() => {
    const el = containerRef.value
    if (!el) return
    el.style.left = x + 'px'
    el.style.top = y + 'px'
    document.documentElement.addEventListener('mousedown', _unselect)
    el.addEventListener('mousedown', handleDown)
  })
  onUnmounted(() => {
    if (!containerRef.value) return
    document.documentElement.removeEventListener('mousedown', _unselect)
    document.documentElement.removeEventListener('mouseup', handleUp)
    document.documentElement.removeEventListener('mousemove', handleDrag)
  })
  return { containerRef }
}

export function useState<T>(initialState: T): [Ref<T>, (value: T) => void] {
  const state = ref(initialState) as Ref<T>
  const setState = (value: T) => {
    state.value = value
  }
  return [state, setState]
}

export function watchProperties(props: any, emit: any) {
  const [width, setWidth] = useState<number>(props.initW)
  const [height, setHeight] = useState<number>(props.initH)
  const [left, setLeft] = useState<number>(props.x)
  const [top, setTop] = useState<number>(props.y)
  const [enable, setEnable] = useState<boolean>(props.active)
  const [dragging, setDragging] = useState<boolean>(false)
  const [resizing, setResizing] = useState<boolean>(false)
  watch(
    width,
    (newVal) => {
      console.log('width', newVal)
      emit('update:w', newVal)
    },
    { immediate: true }
  )
  watch(
    height,
    (newVal) => {
      emit('update:h', newVal)
    },
    { immediate: true }
  )
  watch(top, (newVal) => {
    emit('update:y', newVal)
  })
  watch(left, (newVal) => {
    emit('update:x', newVal)
  })
  watch(enable, (newVal, oldVal) => {
    emit('update:active', newVal)
    if (!oldVal && newVal) {
      emit('activated')
    } else if (oldVal && !newVal) {
      emit('deactivated')
    }
  })
  watch(
    () => props.w,
    (newVal: number) => {
      setWidth(newVal)
    }
  )
  watch(
    () => props.h,
    (newVal: number) => {
      setHeight(newVal)
    }
  )
  watch(
    () => props.x,
    (newVal: number) => {
      setLeft(newVal)
    }
  )
  watch(
    () => props.y,
    (newVal: number) => {
      setTop(newVal)
    }
  )
  watch(
    () => props.active,
    (newVal: boolean) => {
      setEnable(newVal)
    }
  )
  return {
    width,
    setWidth,
    height,
    setHeight,
    top,
    setTop,
    left,
    setLeft,
    enable,
    setEnable,
    dragging,
    setDragging,
    resizing,
    setResizing
  }
}
