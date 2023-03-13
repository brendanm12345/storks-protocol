const blockId = "d644582dc8efb54a614580cf5307879e81cfdedc525e30c3715d1fedd5099e"
const blockId2 = "000007cac551c76380826a56d98795f9df8388fabbe3a747e895abdc08b52784"

const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'
const TARGET1000X = '000001174A8000000000000000000000000000000000000000000000000000000'


function run() {
    if (BigInt(`0x${blockId2}`) <= BigInt(`0x${TARGET1000X}`)) {
        // if it satisfies
        console.log("true")
    } else {
        console.log("false")
    }
}
run()
