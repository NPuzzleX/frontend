<script>
    import Kofilogo from "../../../assets/kofiLogo.webp";
    import MonMonPict from "../../../assets/MonMonPict_s.png"
</script>

<main>
    <h1>About</h1>
    <div class="item">
        <div>
            <img alt="MonMon" src={MonMonPict} height="auto" width="90"/>
        </div>        
        <div class="item" style="flex-direction: column; border:none; align-items:flex-start">
            <h2>MonMon Mnemonics</h2>
            <p>
                Particle physicist / Part-time programmer / Avid tea-drinker / Believer of Adeptus Mechanicus / Gamer / Vesties / Miofa / Soratomo / Kakera-san
            </p>
            <p style="margin-top: 1em;">Just a Nikoli puzzle fan who wants to be able to play puzzles anywhere with a tablet PC and not losing the ability to scribble just like a pen-and-paper puzzle.</p>
        </div>
    </div>
    <div class="item-d">
        <div class="subitem">
            <div class="primary bg-accent-2 donateBtn">
                <a style="display: flex; flex-direction: row; align-items:center;" href="https://ko-fi.com/3mworkshop" target="blank">
                    <img alt="KofiLogo" src={Kofilogo} height="32" width="32"/>
                    Donate
                </a>
            </div>
            <div style="width: 100%;">
                This whole operation takes just 15$ per month for the server rent, you can donate to help maintain the site. Excess will be used for buffer <b>and tea</b>.
            </div>
        </div>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        gap: 7px;
    }

    .donateBtn {
        width: 107px;
        border-radius: 7px;
        height: 100%;
    }

    div.item-d {
        width: 100%;
        border: black 2px solid;
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 7px 13px 7px 13px;
    }

    div.subitem {
        column-gap: 13px;
        width: 100%;
        display: flex;
        align-items: center;
    }


    div.item {
        width: 100%;
        border: black 2px solid;
        border-radius: 15px;
        display: flex;
        align-items: center;
        padding: 7px 13px 7px 13px;
    }

    a {
        border-radius: 7px;
        color: white;
        padding-right: 7px;
    }
</style>