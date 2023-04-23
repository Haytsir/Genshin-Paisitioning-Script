// ==UserScript==
// @name            Genshin-Paisitioning Script
// @name:ko         원신-파이지셔닝 스크립트
// @namespace       genshin-paisitioning/script
// @version         1.6.1
// @author          Haytsir
// @description:en  Show realtime in game location in the Teyvat Interactive Map, in browser and mobile phones!Support genshin.gamedot.org.
// @description:ko  원신 게임닷 지도에서 실제 게임에서의 캐릭터 위치를 실시간으로 보여줍니다, 브라우저와 모바일 동시에 사용 가능!
// @icon            https://genshin.gamedot.org/asset/xapp-icon128.png.pagespeed.ic.zyAE0ntk9a.webp
// @downloadURL
// @updateURL
// @match           https://genshin.gamedot.org/?mid=genshinmaps
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           unsafeWindow
// ==/UserScript==

(o=>{const i=document.createElement("style");i.dataset.source="vite-plugin-monkey",i.textContent=o,document.head.append(i)})(' .gps-user-marker{position:absolute;z-index:99;transition:opacity .2s;opacity:1;pointer-events:none}.gps-user-marker.hover{opacity:.5;z-index:inherit}.gps-user-position{display:none;border:none;background:transparent no-repeat center;background-size:contain;z-index:10001!important;transition:all .2s;--dir: 0deg;--rot: 0deg}.gps-user-marker.gps-pinned:before{clear:both;content:"";display:block;position:absolute;border-radius:50%;margin:-2px;height:4px;width:4px;background:rgba(52,172,224,1);transform:scale(1);box-shadow:0 0 #34ace0;animation:pulse-blue 2s infinite}.gps-activated .gps-user-position{display:block;width:0px;height:0px}.gps-user-marker.hide{display:none!important}.gps-user-position:before{content:" ";display:block;width:48px;height:48px;margin:-24px;background:transparent no-repeat center;background-size:contain;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAA0CAYAAADIZmusAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAsZSURBVGhD1ZkLUFTXGccXd9kH+2J3WWABxVhTqM20ziROmWlmKFYmMuN2ho40QyNSNDDV1BpUVMDk1igCoqvQVqPNFB/RDsQ0QoyaatgqAeUhYERAXqaamNg0WpvOpE06oed/937LubvXoGgwOTO/2WW5j+93/+fce+69qq++jYT4+MY0Kvhu+do0peI4BGGSiNL/ZDzQplAQFT4WSus+mCbtPKhIr4YvLj7bqwfSSqpH83aFTl92VCf9qQpaf2LbaKFUAAoEMzJqtSjcKXhNSsTl1xgALS+TAOJ2J6zJJQAd6bj8ZoOj4G2zXThrsQqd4Rah2w6spe/YbGXt1qiVbxpdQn0YyfDbEJk4kWCJ5GRBIyYhePWiACvasrXbbqrsdxq3D0WJVAxGQshR3mt2Ct0myGCdIBna/lfffDvKyKhVA/wStWCfcVreCWt04Wmno6ovkUeTeyAZqKp7pwJDZX+cS2iPiF/uDXcuZV1tfo0BB4KYIBG5BHaMI+pcWmuKWXvCESU0RfIS2if3pE2q7n4ekIxpS18iL+PKqw+bPrdS5xeZmFTkIjMyBC2OKKXh3NwSzUuEHug5quoZGQHq6u69kDFsH5oFGefm7milVCZARC6BnUIE3WrK2iM2MY3y3hgSMcxen67p/eIDEgH6mcXZusqrKSSDVEiEUpmAseLbMB054Jq3KwzdKrLwTJS97HycgxVn3DKUqs+pyVS/1v+2ZviLT1UDTIKouXhgUu6hLINn8DEi4tlTrrjFNfbvsQMi7oZE/EL3tUlHh22YJOKTq/ViGkuO2CACCUvF0CyITJrnyYKEKHKVCQBJRpf+2xzd+s4UErEVt06O/PXJqOlP7bcglWCR+5qKXCQ+u1qPNBIWHTZTGqKE59IcPg2ZiCQTenjgr3wq1tLOqXwqQTL3T2RUwi8ipTFtzQkrn4Zh+2A6n4aSCPvtJp8Ku+ZMQyrs7BWBVDDugkXuWWZUgMDpFonEPPNnR1z+yVh7WX8SocupzVHVDb+hepcVTbwnQTLDIyOT3rhap1/8SrZ6y5lUg6f3MXtJx4zo4rfiXSvqI5B03PytBtl+710mWETFzliuvF1hUb98MzK6uCmeJCzPtaVqVr36nKqPFUsSHzDelyAZJgL0iw8Vhla0ZFsrB1J4EXa1Nyl3r3GLSCtzG8QO+DQsm85N59NQH7vaKZMA1zggJIlQKhDhU4lf/lr4fU4lWAT9F/3YuepINNIwb+r6Np+GpoeNCV4CXJf4kAEZSQRoKs4WGta3pPOpxOUftycsesl8n1IZlaDTLY4QjhSuxrbiU5NtZZ3ftVf2J5k9Q25d5r4cTdNHA5rLrEAcdSr+HwwaI7zQ3yQarjWbsg7mUqoghm0bAx/7w37pAgzGIRMsgjMV0ggUMa1rm6+vaqyChEwEEv9kXJK4IQERkulnUxdP8w5LUcsTJIKkMf6m5dVasV/0gnGKjEpgZUoDcePix0vYqgbT+DREEV4C3zsl8B0iNxmcTMjp6/18Kk427pAKZLBPjEkSuUuZYBFcqDAIMcMlEUiYCt7K4NMQRUjiEwau5iSCVPAbREgGqQx89jlSMS499jOIYNwhFYxDXCQhMo5UfAvRSr4VffcbOFPFrvbGWcsHUgjLU/szVc03hmUDHCK3pE+SID5mkMxHDHY6Fg9A+60rYVl7szDecAZzvNCaEFF0yoUJpZgK69bUxe9w4MtFcCRwF4cu5VzljY4qPvsQL6E50HsQ/dwvgkIh8SkDvweKIBX8DzIQYev402TbggyS5mUwVtAj7kJELgEQK6XhWtM4JYLFTiKmOSW5ml5WDJ8GRFAoZAIlCKSBZaRU/CIMbDNQBF2aTwV1jSEjF0EaEEEa6FLODW3fMpVd+A6fhkyEus3t0iAwbrhUeBFsE5NOXsYleCP4VMYQkX7EAhIQQRp4hBNR1OZyvHA+AZM8s6fXrXF7ltHORQl0E/5IKwkQHQws82/pE4Me1xnpdGxIL883bRl6nLAXNcfGPHPCgZuvwBpF5E0ugqsq5lOYpvMSxp1Dqbqclxer6gbqg0QoDf5MBS5K8CI0Vv7FwLp0Bhti1F2p1z398i9IJHzDuXjIoBblpy6yFiyCNHDxk6Wx8ZwbIiQhilAadDbiJVDg5xL4TiJfkgq2CRFDUaMbIubyiw/bNrROji486kRNY4soSMQJzXY+jbDcP2XxachEAtPgJXgZEqGxgnW5VMRtcqmYtw0n4J4FqUAGDwFlMqNNnga+Y5BbBW94lNAVGbbtvZlAu741TV3aUCoWgEkfpuTsah3CBnkI6yLiJx1xdLf/3Qb8j08FSeKagys/NzvWrawr1b7Y6jZUXk2ylQ1NMW9qceABoO8CWTt68zXagkUcBYfNFpZGmKfHRSLqBX90q18fbvJLoCCIsGJEEXYfIop8mQRBMnS1p+kMP83/y7Um7eIDooi26v1EksFzsDsS4dMwbL0Uy6chxn47ESYRgmm6UuFKkAwkFERA6KaGUp3QPpsXwbNj1DguEUojSAQS/2Gwvh3CzkwhGAdKRSvxGQPPu7A9jBXIBIggFfX86oxxieBW1ram3Woq6XCia2lWH03Srj5W6H/QBgEOE5Phmc0KBKYRH5AjdAw3KxrMuv7fm7EDn1zWsG3IYAeLJ6zgWIGx4HiKqeqdROu2znCIiO9XqF5iLBFD+u6kkLorDUoiIV03m8zeoQ7L9hO7w3NeXILvWaxIghexMH7KiUBCt3D/0+odZzyaw32vq9s+7lcSCX/1RoPu5y/duwglApmQ07ca1HvOlYYuf6VUO7vCrc38g1u36OAi47rTC4Bu7uYlURf+3sbLJLDiQbaEXyJlwxL9usaFhuLGDH323iwQyuZahsL6fO3u1j2ahmtdAImYVhwXJe5KZIZQq4UIzlrGiq5ITXVPEmSQDNA+e8itLT3pVu87J2LaMZxBQMY05/lcyKB7QYQEwDyGuuNGJ0nod1/JNP9+yM1jLOlIDcurmat9clcagASlQSJ4SSSTAH4RSSY52auBsUtoD4uq6DLiwTS7G4yz7rw8Fdh2DD4iUtEjYq64+ANg8vT90Pi7d39sXOn9kS6tLEfTfK3hcSbCk9jQ16JL+02OYd2Znxh3fpiKC56FTQ55zNsHHzbvGE4QPxl4QYQXRnhJhAP8aF57qH867xPg26gIztEQwSs0yJiE9ggmFAkZSFk9l6aByNJWEYfQnmgraX3EurFzJoSsmy/NVJKBhOqJ8kxIiHOo0gvfB5g5YJbr+zyfYCvrngKs23qnAvOmHgdJ4JWe76ruvTMRpAIRQN3MurbRBvCI1MdJEdxfi/fYxaceghRESMawcH966K8O5hLsoPgmgkzAips0Bu45eGLWtjjwroUgAXqZ6ktjLBERlYpkkIw4sNgJgFLC7eeMpbV+xDdOy45aWN+NhBCJEGLxDDwfBiThWuGNAHgtAfzbZPvGOMDsAviu4r5axFJ5iWARNE6GWxBCPtiRgBCbVBK4Z8EnLlAoAg+18YAtYmOby76xMxZP6W1bLkwG+Bu/R7OzIV4M4c4PAuKzsmRBjztAQLfXANum/fM1yWoNbvw/JfiVJSAUCApAQZBBOpDB0Ra7YIkPvNHCb5DAMpDAzRL/YAEo7VNGUJ2KLXAhRsCG+J3yIBUwfRluynzdDe8W7eyToG4EAd+RF1gXlm8ncH9ByOobs3ELB2wocMdjgb7t69++7ZEw/R24fOD+ghDXu6cmiSkRsDN6gKFE4LIiStv0MyFNaccMpWJ5lNYReeBNqai74WvfJqpgler//IR+uAqdU6AAAAAASUVORK5CYII=);position:relative;z-index:3;transform:rotate(var(--dir));transform-origin:center;transition:transform .2s}.gps-user-position:after{content:" ";display:block;position:relative;background:transparent no-repeat center;background-size:contain;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIUAAABhCAYAAAD4D2KoAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABtZSURBVHhe7Z0F2G5bVYWBS19CQBpERQxsxRYwUTGxCwNbUTGwRcLCQMVusRW7uzHAAAVM7C7shut4151jPWPPb+3vnMM9994T33qecdfuWPPdY869///89waXarvqqqtuiHK66UbRW6v1B/Ix6U/tAm8KVAYyg21dsaMbL5ZZ3i+P4ekNLKgu5dSuy7YKhOQgOWhdBD11k0W/N02/Uj9HXgOa11eXfmrnq8Xg5oA7CPQOkIPloKKbtumlnv/859/sDNOr43WtYMlrPkFyTVsNoAfTA+vBTgAShBFMREArqDfP3tM1fwtPn618jDiWz+lr8DVZHZITHOfSYsD2IEAbABZBygDewtL8LXPa0vyVOZ9a7Vf9PDbTNd+vo8PSITkBcqzF4CQMHYQNBJreBF/9QdA1fWWXlt+qS8tvvVqeiv3HcelTWraBBGn+GCAJh3V5A1IDkBC4NwS7IDD4SNMHwdd8BvLWodtEvyvtd9vF8tx/qJ0nzz8AcV/TGyfRfEJi8BOSywsO33DdvAfCA+PB6jXBBABpfg+AGUgtu23ohdr0Md1usezgOHkuaQOL+glJaZlqNH0mOAYgNXSXXuPmSukIaLpCDNbGDdQPAKKfQZA6BATOgaW/ndbf/ojusNNv5GM1dWgSlgM3UT9TjfoVIB4Lj43BuLTg4GZKCYNv/iYxKDM1qD9wBPUdAAdjBEbLR+DoJQI7pGUv7D6lZXdM5TJP5/a1bB43lMAYxHFtWjcBQVo2XUTTB4CUVu5xacDBxceNdGdYFYwTBPWZEgYMmvfT6IHfAKD5ZbClO4XuvOjPRnmMeWyfs847IUFalqAMSJDWbVxE03uAdDgu7rTCBdeFd2cYN6qbnylC/QqEDsEAQctt5xME9Rn8TTC1/i6W5u9auttimr7L20zFscax6UuGZfRa110lIfF9DUDUzxQjDTCQple1hx+sCQaqYb8wW12kYUggpjNww0jLJgzqe2owDBMETXugE4IBgtbtBf/upZy+x47uuVhmeV8fawNOO78hMSgdko2LaH6mGM1POJCWreBYOceFBwYXVeruMF0B1U12GBiMlSOMQdR8d4M7adkKgAw8IpgEekjbv0iXlt/rmGK7eZzQCpoJCtK+CUkHxLD7vndTi/oJh3q7RofjwgGDi5ESBuQLf4Fg0HQHYaYD9R0CB2YTeM07sC9qaf7F3Nf0i3s6l62W1zofZwMN0nzCYkAmJNrmwEW0rAPiGmSTWjR9AAfSNGAgO8b16xqcPC7EMBy4gzSsUDoKg/osFAcImk9H8CAPAJDWHQRf05vgWlp279JLLPqVcpt753Fi+gAW9QmJgZ0uonWGA+25R6aWjXNIeyllA0eF6bprOmmvHY7CgLQu64WRU7Wsp4ieGhKEAYPWbUBQvwFA8yOIkoN7n9JLNr1UKadzPre1OI6P6ePvQiKlkxwAgrSOe+3OwZhsXEMaD5Q0XKOUKSXBMBzXvmtwkpKBOHAH9atUYSDG9wRp3Lh0zBUYvI0jqN9AoOkEwIF3P4Ks7V4aafplQveNPpXbTPkYdZwOEOezBiRI2w5I1G/SjfqeYpapRRrOoXUHcGh6mVLU91rj2gejTmISJwyl8VYhHYVB05kmsk5ADNR4orTcT9iEQVq5wHiKtU0GzgF1sF+26eVKLx/Tq/kU+x0A1M7bQTlwEvUzzag3HCtAhnMgTXfnWKYUpGngSNcYYKAK4/lpddB0B3Q27jDqBk3bHUYOldIZ7AoM0NIV1KcboOkC6hMAB9w9QX6Fplfs0nFeCeV8ri+xL8dbgXMAinoDYkgOHKSU6WXpHpqeNYemD+BQv+cajtX5BcMHkwzEQbqoi+q1Axc+6gb1m5pBfaaI6QqSB6qDsHEDTScECUBCkMF+5dCrWFr3qqgvy3lp7hvHOxMsExJt313ELtcBOUgtWjbBkGbNoX7UZNIypUg9ndjdr3kBqoN0hxhASEt3UJ8wpDuMukEyDGg4g3TMFbojGARDsAfAJshI0/crvdqOXn2xLHW/OM4GmDpvh8SAGNzuINzfhEOazqFlCUevORhPxnWmFE0vaw0pwSB+AwxUIT63ph0TCA46fnil/igQmp61g/oBg6bTHTZpQjIMfoLsDAzeCgTkAPgpngCoz+ATaPQapdeMPvVaOz3yvpaPOUCx6ty+jnQUX7MBua/W2T0O4FBP7ZRFKWB0ODavsZp2OsGlDxwDaTpd49zTSe2QQHDA4RCSX4cGDHUhADG/N6hfuQM3toGhtHEGrbcr+AkzDOkG3QH8NBsAB9QBfu3Q66ykY70uWqzLfdEKGEOSoAwnqetNF5lwSN09xoOhZcM5NN0LUsaR8eyu4Vpjk06kWWdIjmE6xtlBURuzEzsjv2EcvF2oT3cwEOkOhmG6g5Q1w3QFLcsUwcChmRrUD0fQdIKQLpDBn0HV9g72/UsPWOiBO/J673v/OF5Cw7lRh+TAQdQbDkA/BsdMK5rucCxdQ/0AA2l+uobUC9CNY1To140NauMDIDQ90oW0edWU/BFqr5AcdUMpXyu7MxgGBmvAIB0DwYEYEGibESykeQf/gZp/Pfc1/frSG1RvMZ/KdUOxf8IygdE6zmsouS67CdeLDEh3j4PUoh44GJ9VSlm5BmOfrnGQTiQ/1AbDjoHWqUQL7RCGYtYQUgJxUD9IPV0Md9A2M1VoOovI8SahHhDOBEOCMNOB1h0AgLTMgbcI8htaWv9G6t/4bMX2luZ9nAlOnc+gJCDpIk4100EkF6orOHhIdlOKtCpEezqZYEjErRego06UHPNt8akFBzUEO9YBMmVk/bD3qrnnDhMGpOkNDFo2UoT67goGAQ1HUN+dYAOAljmIBPZB0ptEj9606c1KfTnyPj4GmsCoNyQDlLqeCYnmDYjvwe6xgUPbcf9OK4zLSCuSXSOdoxeiq+8arjPG24n64RjqEwynEkyA+F+dTviPZFomEOqnQ6jvQLh+AAi7A3Y2agepu0NPFS4gjznDxhXUr0DoEDhoPfAE/MGhNw+9xU5v5X4o4TEsK0j2AEn3GHBoOffd4ZiuoWWMm99UGE8X6XaNg3SifRKMA8eQssbYpBKgYGKkC+lMNUQ6xNmkC9whgUh3mDBIK2dIV1iCoD6dAGXwHVSC/Jalt2p66x3lNt7Px+B4BqeDwjUMJ6nrG4DUte+5B/dLapnOofVZkK7gGIWolGDMdCKlY8zvGRJwDDCkkQW0zG8mBuPqNFILDhxCMhCzoFS/C4Q0PkJJdgfXDnaHAYOWcdNZQO7B8ABNM6ArEOwABiEBcEBHkLXf2yBNP6T0tqG3a/NdD/H+dYwOjkExJL6mdJGle2jacOAe3TmyIN11Dc1nOtmtMzS/SSWlnkrg4OqCk4laeCxlTCDUZ/0wgZA27iDlW8VMFdou04TfJDJN2BkGDNKwZylhMAh+gicA6jPwBP3tLa1/B0vz74j6spie+0kcxwDRT1g0bUgSEMR12kFW7rFyDhek3TX2ao356iqt6owDx9D0AEP9TCUS8d++gbBAG42iUpopQ/3mC6V6TjTrB833bw9QbCBm7aD1wx2kTBUDBokBSWcgTSQMDKxhsCMMJ9D26QAO3Ai+eoL+TqF3Dr3LGZTbIh9jQKM+Ydm4inoDguwghuNB2sZwpHNkzTFdQ2K8lrWGNN9QtH71djJTiYRjLGsMiTSy/l7BCgmnWKYM9XaICYT6rB8SCC5+r3boqSJrBsPgWsGukKmhO4IDNJ58yYHMIL+r9G6ldw89tJTzud77sD9KYDooE5C6vpWD2D1G7SEdOIeU9caq1mBcAQPXsGPsgcEDnGBsHEPCLc74AetG2pBvEasaghNgTZyQPMYF4A7zdVM9FzrrB6mni4NUIY0CUst4gvZgMAi27+4GhsDBy+C/R+g9kfZ9rz15vbeVcv+EpYMyAJEy3QBu1iDcj2uPA+eQhmtIrjWcUmatITGudg1/8NpzjN1Uop6H/+x+OMaGEk6RQLiGGEBIdogsKOfbheZ7upi1g5SpIusGBomnaAWD04MdoYNAkHjKl8HX9HuXHia9T+h9S7nMYltr7F/HSlDSWTaAaFvXJnYQA2LnyLTimmPPNTZgqM90cs5gSLjFuf20VDtcoQPwdcxAjJQhdSD8urlXP+AOM11Ie+6wB8NwBk2nKxgEB2OCoO0MgINPwN/P0vr3T2nZB7jvim28f8IzQZEMyS4g0qw/dEzuK9OKnWNVb7jWYPxW6WTWGZqfYEgUoHs1Bk5xRYX63Bo76gA4BWljAiGtUgYXNl83JS4curmRXkimOwADAzILSG2zSROSXcGOwKAPV9C2CQEaEGj5DHrpA6UPCn1w6UNKnre8Te7TYUmXGZDU9QCJAeF6Dcem9tA092nncL0xUoq0qTXUZxHKuPY6ozvGfTS9cgyc4gUDwo0D6EAQNmoITqTpVcrYqx8OgFCf7rB5m5BWaYJBNQzdEdINEgBDQGAd+IdLH9r0YU19Pfsg75/QcA47TTrJw+r67CDdORKOfGPJlHKs1gAMxnf8kE2yY1DHbVKJlI5BCrlmQLjpQDfWAfkeMYGQ8pVzACHhECsgnC6ydnAhmaki0wSDl2liwCDZFcZTqu3tBgRoDwCC/eHSI0ofEfrIkOfpvW0qwTEs6SaGMgGxezi9uEAFdhelvd5I1/AbSgfjoM6QOhi8mYwaQz3xu3GF9Pw0DqgDQ1t+sh5vGJrnl1/sEKOg1Hy+XdgdDAQwcON2h6wbls4g2RWc3w0CwUgIDADqQf8o6aNDj2zystzG++Rx9iDhOoBkOIi0gUNapZVRkKofriElGIzTSCc1fk4nHYz5Y3mJB3TjGOpx+PMLhJsOzI/TqScMxCgqJS7INUR3iFUxyU1n7dDrBgaNwds4g7bHFXpaIBgGgUAZBAfTAf+Y0sciHevjkKY/vsvrav3YXmLfhIfjc550FQNiOJxiDEfWHYaD+x0pRRquofXH0sl0DM27AF05xqgxJNLHTSqE107jBDoR6SOBsEP4+8OqfnAxOdKFNGoHrU93YIAGDFrOwCUMPHmGIV1hBcIm+Ood8E+QPrH0SUfkbSz2QxMYTSckHRAA5dqAA3U47ByZUs7kGgkGhTpg8Np6kEokF5+4+rULhJtOxA/PoNA1RDrE2QKxKiQfqn0Mg1NFhyFdwSDYCRKCDsAnS48qfUr0Q9rv0Tlf8vaI/ZGhmZCoTycxIAkH123nyLSSrjFrDS0zGLhogpF1hlNJB8OphPRx0wrZddM4oU5MChlAaH44hJQpgxvwG4aBcLoAiKwdNnWD9neqSGfIOmE6grYlMH6aDcEm6NJjSo8tPe6IvE3qMTrPo5GmE5QVIE4xdg+u23UH95M1x0gpEvfvWmMvnUwwtGw4hvqsMfy6Sp133QLhppPzuxe4xcYhJEi2Q+TrZtYP0x2kCYSOkXUD1msY7AwrGBKER2k5gTMADvSnSp9W+vTQZ4RyOfL2iP3RAATVeewoE5C6LsPRncM1R3cN4GAcSCmMC+NjMEizgLFxDC1bpRLicbMK0fXTuACJFNId4gAIrcMW0yH88Slrh3QH1wwMqtNEh4FgpBsYAOTgjqBrv89Emn586bOOyNs8vvZJcAyJXYXzJhwAegwOpxTgsGsMMLRPFqEJxsoxeo3Bp4DrFwg3XRi/2kUK4QI3NUTdSBaU5M3hEFrGAJAuGBDXDukOWO+sGbQ9gwwIhsGuYEcgUATMAezB/2zpc0NPKHk616HPiZ59Jyw6r0Gxk3D+dI8Jh0SNk3BkSumuYTBwDIPhOsNgpGMYDMb/5hWSC6NxQbowclsHwg5hILhRbnjWDxIDgjswQOkOpIpHan9gYGAZ5OEMWmYYViAYAAeVgH9e6fOlL6gePbHmu7ze+yVAExJdh93HDtLdozsHqc/1hl2jg0EaTTBGASqlYxgMajbG/RYVigurcWES79HTIaSsIVZA9HSR7sDTBQyuGZwiNjBUUBKEFQQEH32h9EWhLy71aYvtUcLDMQ2JAbF7ZHp5rJYB76w5NN9TSrqGi9BRZ2hbwHABugcGqePCBMJNF8sv6VBoHnMI0oWB2EsXCUQWjzyJdoZ0BZ7gDoEDSqC/JPSl0pdF/+XVp1iHcj+OY0AMiV2E8w/3kLgupxbgyJojXYP7xDUMxqwztJ76igeH8cpUMmsMiR+337KG/sJuXKgumDTionLjEHXDHQinC+zVMIxUIdkdVjD4iQWGdAKDkIH/itJXhr6qlNOe9/YoYUlAULqH08tILeq5XsAYNYfklGLX6OnEdYYdI8HwWwkP2oMvGiDcdNH87h+V8l7KWAFhd+BpyiKSQfVbBEAw6OkMwNBB6BA42F8tfU3oa3fk9WyPEhSObXfpDsL1cF0dDoB2vWHXAHzul/s2GKtU0msMxvXKGuqLq3HhEmnEbxl7QGS66EAMd6iBdc2QMBAMgmK7NwwGYQZfx/g69U+Svr7pG3Z6tn0S+9W+PpYB4xyGg3MbDjuH4Rg1h+SU8ri6P6eTDsbSMbQP40iddnEC4aYb4VfJSSMGgieAG/YbxgEQkmsHuwOpAhiwZwaaQU8YCIpBsBN0CAg0+sbSN0nfvJCX0yNvP0Gp49pNOJ8dZA8Ornu4htTBwDUSDMYjwUjH4PcwblVDe3E33Qy/Sk4+3AOCd3kGxvXDAEID4LeK7g6kCsPAkzphCBAMgYNLoL9F+tbSt1na59utWO5t6NkvQemApHsYDqcVrtcFaaYTgHed0R3DYLj4ZNwYv1vXkF4ajRuSyIncKNX2QQ0hMUCuH7DbTBfdHfZgIFgJwgiug440/x2h74zeyvVPrn0MCDIg00Hq/LiH0wpwdNdwOjlbMMZbibYlbVxaQLjpxvh3BryOGgg7xAaIGjCAYADTHXj6nCoYfMPg9ECQDkDQtAP8XaHvlr7niFjv7RKUJ0t2EzuI4ejOka7B9XMfBsN1BmDka2uCwThRi92mhvDSbBo0/nUSX+66Q7iGsEPka6bTRboDT6XTxAYGicARQIKZAHyv9H1N31/6gZi2vA37JSgDkgLODmL3GHBIXJ/rDa470wn3NcDQMewYCYbfSqglLm0g3AoMcqXfMhII0kU6RE8X6Q6GgSc2YUgQMvg/GPqh0g9Hb3kd2wGLgTEgaDrIAg6ui+tzMWownE42YEjTMWo8eFAezjjVkF0eTTfMP1sjZwIE1Xh3iKwfnC78RuG6YbhDBcXOkDAQSAJKcB3wHyn9aOjHmnId2xoUA8UxOX66R8IBpMM16np7OnGdwX1yvwbD3zIewfjUUF1ejRvXAPADL79l2CFWQDCw2DJPIQNuGHAHw8ATbOu3GxgCgv3joZ+QfjL0UyWmvY6ebROWBMTuYTiGc0gGA2gzneyBkamEnwZfnkC4aQD4N43kT9IGA5QpgwF0/eBisrsDT2k6g13BbkAwHWQH/qeRjvEzSNM/izxfy8Y2kvfhGMiAcPxMMa470jUynWSdkWBkKuG3t25XQ3N5Nw0Gf+6Anwfw2uaiMoGwQwwgpJU7GAYEDHaDCYE0gi/9XOnnS78Q0ylvN4BRz7HsLBw/04udI+sNrnMFhh0jawzqiNvXkJwajQGRqL4ZKIqynjIYWBeTDDhPJQHgKeWJNQx2hgFDBTMhAICnlH5R+qXWW94GTUjCRewemVZ6SjEYXPceGLyV8Dn/BMSqaWD4B81U4R2IfLswEAy8gXDNkM5gRwAC5MD/culXQk9t8nK2Yx8D42MlHK49MqW4EHURunIMF5/c7x1qCE5t1RggiS9+VO2zhpAMBAO9AmLUDOEMPNl2A4PgoD9N2/2qpflfQ56O5U+TEhSOsQdHuoZrDTvGARjaj/vjreMExNk0DRh/F4Mvfx0IO4TrB9cO6Q5OEXYGgjkh0PSvh36j9PSQl3mbBGYFB+fjvE4prjW6YziVGIwncJ91y6d2Nk2Dxp/ieaIGjireDkENARAMOAM/0oW24WklMAQJdzAMT61gElhDQOCfUfpN6bei97TFNgbFgOAeiONzHtccuFOmE9cZBmPUGHU/vIresW711M6lMXAShRj265SxcYgCgoBkqhgpQkoYEoRnSs9qenabZxtkUNi3w9Fdw2C4CE3H8FsJhfQJiGvSNID80RSqdKp6OwRA8EQSABeTPLUDiHKHdAa7gIOPflv6nei7WG5QlnDUeQBwA0aB6lSSxSefu+9Ut3Zq16QxkBLVuovKdIgEYtQO6gECGNIVEoTflX6v9PtNXs42KAFJOJxWcA3XGk4n6RgDDF0XheUJiPPZNKD8rSbeRuwQriF4QgmI04VTBYEzDH76E4I/kJ4j/WH0FvOIbdh2BUcHg/PbMRIM0gjXfee6lVM7n01PG3/djcrdbxmuIToQThV2BsOQIPyR9MelP4lpxLoExHBwHI6XruF00sHwWwmf5O9St3Bq10YrMHi142kkAK4hjgGRMBiCPy39WfQW8wkKkBgOpxaOz3kmGHUdBuMpmueXfE5AXBdNA84fZuONJItKAuP6gYAROJ7uFQwE/s9Lf7Ej1hkSA8JxekpJMLL45E3jrnXJp3ZdNAZc4jU1i8pjQABDgvBXob8OedlfSgmH3cOuYTC6Y3A9XNcJiOujaeD5+558zNoDggASSDtDwvA3ob9tYpkh6XBkOjEYWXzyHeVudYmndn00AiDx7cJvGd0hCCRBJbh2BQL/d6W/D/1D9V5nOOwcgLFyDKcRXpdPQFwITYHgL8ny6ueisqcMAkpw7QoEHAD+MfTcNm9A0jkMhh3DNQZuwavy3euSTu1CaARERR4ftJw2VkDYGQzBc7XPP6n/51QtSzjYDzi6YwDGc+q8JyAuxKbA8EfJ+WjkOoK0keliuEOA8C9N/1pKOIDHrgFYgMFxOT7n4QPaPeoSTu1CbARI4nOz6wg7BIFNZwCCf5P+vYlliPXpGuzvVGK34DwnIC6GpkDxF+v5gMRTTSBdRPLUAwRuQOD/I/SfJc+znu2Aw/WGawyOy7eIExAXU1PA+N9Z8SFpuoSUDmEQ/qv03zFtOAwG+zmNAAWftO9Zpzq1i6kROImPSYbCdYOBAAT0P9L/Vm842IZ00qHgeCcgLuYmt+B/fvf0qg2AgkAnFMDwfyHDYTCGW9T+z+B4dehTu5hbgcFnaJ56Q5EO8bxQOgbgOIU88wTEJdYKDL46AkV3iedp/VXqaXYLQ8H2zzoBcYm2AoPP4ekUAwqJ5hTi9AEUzz4BcYk3BZn/uxE/OCPo6RZ2CKcO1vMzjXvVrqd2KTcCXQEn8ECAOhD8POMExOXUCLhkMOwa9KSMk0Ncrq1qDH4PgrcLf8M4vWVc7k0Q+C8D8ycJ+f+SXNx/uPTUzl+TO9ywJi/zdoMb/D+mFDuO5RtApAAAAABJRU5ErkJggg==);width:133px;height:97px;margin-top:-122px;margin-left:-66px;opacity:.8;z-index:2;transform:rotate(var(--rot));transform-origin:bottom center;transition:transform .2s}.gps-action{position:absolute;bottom:20px;left:20px;z-index:99999999;margin-bottom:-10px}#mapsMenu #gps-root .gps-action{position:initial}.gps-action svg{width:80%;fill:#ece5d8}#maps-menu .gps-action svg{fill:#373a3c}.gps-action .gps-pin{display:none}.gps-action .gps-share{display:none;position:relative}.gps-action .gps-config.hide{display:none}.gps-activated .gps-action .gps-pin{display:block}.gps-activated .gps-action .gps-connect{display:none}.gps-activated .gps-action .gps-config,.gps-activated .gps-action .gps-share{display:block}.gps-action .gps-share-dot{display:none;position:absolute;background:#ff9605;color:#fff;padding:1px 4px;font-size:12px;border-radius:3px;top:-6px;right:-6px}.gps-action .gps-active .gps-share-dot{display:block}.gps-action .gps-active svg{fill:#ffc107}.gps-dialog{position:fixed;right:-100%;bottom:10em;background:white;min-width:300px;border-radius:6px;transition:right .5s cubic-bezier(.7,1.35,.65,1)}.gps-dialog.show{right:1rem;transition:right .5s cubic-bezier(.7,1.35,.65,1)}.gps-dialog.minimized,.gps-dialog.minimized.show{min-width:none;width:30px;height:30px}.gps-dialog .gps-dialog-header{padding:0 10px;border-bottom:solid 1px #BCBCBC}.gps-dialog .gps-dialog-header .gps-dialog-title{text-align:center;height:1rem}.gps-dialog .gps-dialog-content-text{height:100%!important;width:100%!important;margin:0;padding:15px 20px 35px;display:flex;align-items:center;justify-content:center}.gps-dialog .gps-dialog-close{display:block;position:absolute;top:10px;right:10px;height:20px;font-size:26px;cursor:pointer}.gps-dialog .gps-dialog-progress{width:88%;height:8px;margin:10px auto;border:1px solid #c5b189;border-radius:8px;display:block;position:absolute;bottom:0px;left:6%;overflow:visible}.gps-dialog .gps-dialog-progress-in{height:95%;display:block;margin-left:.5px;background:#c4b188;width:.1%;transition:all .2s;border-radius:8px;box-shadow:0 0 20px 2px #c4b188}.gps-dialog .share-qr{height:100px;width:100px;box-sizing:content-box;padding-left:5px;padding-right:10px;float:left}.gps-dialog .share-qr img{height:100%;width:100%;mix-blend-mode:multiply}.gps-dialog .share-text{line-height:1.3;font-size:13px;padding-top:15px}.gps-dialog code{font-family:Consolas,monospace;color:#860000;font-weight:700;padding:2px 5px;background:#fbf9f4;border-radius:3px;margin-left:10px;user-select:all}.maps-content-filter>div.current-map{animation:filter-btn-glow 2s ease infinite}.maps-menu>svg{width:24px}.gps-action-icon{width:24px;height:24px}.gps-config-modal{display:none;opacity:0;position:fixed;z-index:1;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:#0006;font-family:nanumgothic;font-size:1em;font-weight:600}.gps-config-modal.show{display:block;opacity:1;transition:cubic-bezier(.175,.885,.32,1.275)}.gps-config-modal-content{background-color:#fff;margin:15% auto;padding:20px;border:1px solid #888;max-width:500px;width:50%;position:relative}.gps-config-modal-content-header{position:relative}.gps-config-modal-content-body{margin:25px 0;display:grid;gap:10px;grid-auto-rows:minmax(2em,auto)}.gps-config-item{display:grid;grid-template-columns:40% 60%;align-items:center}.gps-config-modal-title{margin:0}.gps-config-close{position:absolute;color:#aaa;float:right;font-size:28px;font-weight:700;right:.2rem;top:-7px}.gps-config-close:hover,.gps-config-close:focus{color:#000;text-decoration:none;cursor:pointer}.gps-config-label{grid-column:1;place-self:center stretch}.gps-config-value{grid-column:2/3;place-self:center stretch}.gps-config-switch{position:relative;display:inline-block;width:2.75em;height:1.5em}.gps-config-switch input{opacity:0;width:0;height:0}.gps-config-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;border-radius:50px;background-color:#ccc;-webkit-transition:.4s;transition:.4s}.gps-config-slider:before{position:absolute;content:"";height:1.25em;width:1.25em;left:.125em;bottom:.125em;border-radius:50px;background-color:#fff;-webkit-transition:.4s;transition:.4s;box-shadow:0 3px 2px #0003}input:checked+.gps-config-slider{background-color:#2196f3}input:focus+.gps-config-slider{box-shadow:0 0 1px #2196f3}input:checked+.gps-config-slider:before{-webkit-transform:translateX(1.25em);-ms-transform:translateX(1.25em);transform:translate(1.25em)}.gps-config-time-input{width:50%;height:2em;margin:10px 0;box-sizing:border-box;border:2px solid #ccc;border-radius:4px;background-color:#fff;font-size:16px;resize:none;position:relative}.gps-config-time-input+.gps-config-time-input-label.ms:after{content:"ms";display:inline-block;right:.5em;top:.5em;font-size:1em;color:#777}.gps-config-modal-content-footer{text-align:end}.gps-config-btn{background-color:#2196f3;color:#fff;padding:12px 20px;border:none;border-radius:4px;cursor:pointer}.gps-config-btn:hover{background-color:#2196f3;position:relative}.gps-config-btn{margin:0 .25em}.gps-config-btn.cancel{background-color:#ccc;color:#000}@keyframes pulse-blue{0%{margin:-2px;height:4px;width:4px;transform:scale(.95);background:rgba(52,172,224,.7);box-shadow:0 0 #34ace0b3}70%{margin:-20px;height:40px;width:40px;transform:scale(1);background:rgba(52,172,224,0);box-shadow:0 0 16px 64px #34ace000}to{margin:-20px;height:40px;width:40px;transform:scale(.95);background:rgba(52,172,224,0);box-shadow:0 0 #34ace000}}@keyframes filter-btn-glow{0%{box-shadow:0 5px 10px 5px #00000012,0 0 #34ace0,inset 0 0 #34ace0}to{box-shadow:0 5px 10px 5px #00000012,0 0 10px 8px transparent,inset 0 0 5px 4px transparent}} ');

(function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var _instance, _instance2;
  var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  const logoConnect = "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjgwMHB4IiB3aWR0aD0iODAwcHgiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgCgkgdmlld0JveD0iMCAwIDQ5MCA0OTAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxwYXRoIGQ9Ik0yNDUsNDkwYzEzNS4zMSwwLDI0NS0xMDkuNjksMjQ1LTI0NUM0OTAsMTA5LjY5LDM4MC4zMSwwLDI0NSwwUzAsMTA5LjY5LDAsMjQ1QzAsMzgwLjMxLDEwOS42OSw0OTAsMjQ1LDQ5MHogTTI0NSwzMC42MjUKCQljMTE4LjIwNiwwLDIxNC4zNzUsOTYuMTY4LDIxNC4zNzUsMjE0LjM3NWMwLDExOC4yMDYtOTYuMTY5LDIxNC4zNzUtMjE0LjM3NSwyMTQuMzc1Yy0xMTguMjA3LDAtMjE0LjM3NS05Ni4xNjktMjE0LjM3NS0yMTQuMzc1CgkJQzMwLjYyNSwxMjYuNzkzLDEyNi43OTMsMzAuNjI1LDI0NSwzMC42MjV6Ii8+Cgk8cGF0aCBkPSJNMzg4LjQyOCwzNzEuNTExTDI0NSw3Mi41NTFsLTE0My40MjgsMjk4Ljk2TDI0NSwyNzkuNTIyTDM4OC40MjgsMzcxLjUxMXogTTE3NS44NDgsMjg3LjQ5TDI0NSwxNDMuMzUybDY5LjE1MiwxNDQuMTM4CgkJbC01Mi42MTgtMzMuNzQ3TDI0NSwyNDMuMTM5bC0xNi41MzQsMTAuNjA0TDE3NS44NDgsMjg3LjQ5eiIvPgo8L2c+Cjwvc3ZnPg==";
  const logoSettigns = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTIyLjg4cHgiIGhlaWdodD0iOTUuMDg5cHgiIHZpZXdCb3g9IjAgMCAxMjIuODggOTUuMDg5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjIuODggOTUuMDg5IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBkPSJNNjYuNjA1LDkuNjc2Yy0wLjc5MS0wLjc5MS0xLjcxOC0xLjE4MS0yLjc5Mi0xLjE4MWMtMS4wNzMsMC0yLjAxMywwLjM5LTIuNzkxLDEuMTgxbC00LjI1NSw0LjI0MSBjLTEuMTQxLTAuNzM4LTIuMzQ4LTEuMzgzLTMuNjEtMS45NmMtMS4yNjEtMC41NzctMi41NS0xLjA3Mi0zLjg1Mi0xLjUwMlYzLjkzMWMwLTEuMS0wLjM3NS0yLjAyNi0xLjE0MS0yLjc5MSBDNDcuNDAxLDAuMzc1LDQ2LjQ3NSwwLDQ1LjM3NCwwaC04LjE4N2MtMS4wNDcsMC0xLjk1OCwwLjM3NS0yLjc1LDEuMTRjLTAuNzc4LDAuNzY1LTEuMTY4LDEuNjkxLTEuMTY4LDIuNzkxdjUuOTczIGMtMS4zNjgsMC4zMjEtMi42OTcsMC43MjQtMy45NzMsMS4yMjFjLTEuMjg3LDAuNDk2LTIuNTA4LDEuMDYxLTMuNjYzLDEuNjkxbC00LjcxMS00LjY0NGMtMC43MzgtMC43NzgtMS42MzctMS4xODEtMi43MjQtMS4xODEgYy0xLjA3NSwwLTIsMC40MDMtMi43OTIsMS4xODFsLTUuNzMsNS43NDVjLTAuNzkxLDAuNzkxLTEuMTgxLDEuNzE4LTEuMTgxLDIuNzljMCwxLjA3NCwwLjM5LDIuMDE0LDEuMTgxLDIuNzkybDQuMjQyLDQuMjU1IGMtMC43MzgsMS4xNC0xLjM4MiwyLjM0OC0xLjk1OSwzLjYwOGMtMC41NzgsMS4yNjItMS4wNzMsMi41NTItMS41MDQsMy44NTNIMy45MzNjLTEuMTAyLDAtMi4wMjgsMC4zNzUtMi43OTIsMS4xNCBDMC4zNzYsMzMuMTIxLDAsMzQuMDQ3LDAsMzUuMTQ4djguMTg3YzAsMS4wNDUsMC4zNzYsMS45NTksMS4xNCwyLjc1MWMwLjc2NCwwLjc3NywxLjY5MSwxLjE2NywyLjc5MiwxLjE2N2g1Ljk3MSBjMC4zMjIsMS4zNjcsMC43MjQsMi42OTYsMS4yMjIsMy45NzFjMC40OTgsMS4yODksMS4wNjEsMi41MzcsMS42OTEsMy43NDRsLTQuNjQ0LDQuNjNjLTAuNzc5LDAuNzM5LTEuMTgxLDEuNjM4LTEuMTgxLDIuNzI2IGMwLDEuMDczLDAuNDAyLDIsMS4xODEsMi43OTJsNS43NDUsNS44MTFjMC43OTEsMC43MzgsMS43MTcsMS4xMDIsMi43OTIsMS4xMDJjMS4wNzIsMCwyLjAxMS0wLjM2MywyLjc5MS0xLjEwMmw0LjI1NC00LjMyMSBjMS4xNCwwLjczNywyLjM0OSwxLjM4MSwzLjYxLDEuOTZjMS4yNjIsMC41NzUsMi41NSwxLjA3MywzLjg1MiwxLjUwMnY2LjUyM2MwLDEuMSwwLjM3NiwyLjAyNSwxLjE0LDIuNzg5IGMwLjc2NSwwLjc2NywxLjY5MiwxLjE0MywyLjc5MiwxLjE0M2g4LjE4NmMxLjA0NywwLDEuOTU5LTAuMzc2LDIuNzUxLTEuMTQzYzAuNzc3LTAuNzY0LDEuMTY3LTEuNjg5LDEuMTY3LTIuNzg5di01Ljk3MyBjMS4zNjktMC4zMjEsMi42OTctMC43MjQsMy45NzItMS4yMjJjMS4yODktMC40OTYsMi41MzgtMS4wNjEsMy43NDQtMS42OTFsNC42Myw0LjY0NWMwLjczOSwwLjc3OCwxLjY1LDEuMTgxLDIuNzUzLDEuMTgxIGMxLjExMiwwLDIuMDI1LTAuNDAyLDIuNzY1LTEuMTgxbDUuODExLTUuNzQ0YzAuNzM4LTAuNzkzLDEuMTAyLTEuNzE5LDEuMTAyLTIuNzkycy0wLjM2My0yLjAxMy0xLjEwMi0yLjc5MWwtNC4zMjEtNC4yNTUgYzAuNzM4LTEuMTQxLDEuMzgyLTIuMzQ4LDEuOTYtMy42MDljMC41NzUtMS4yNjEsMS4wNzItMi41NTEsMS41MDItMy44NTJoNi41MjNjMS4xLDAsMi4wMjUtMC4zNzgsMi43ODktMS4xNDEgYzAuNzY2LTAuNzY2LDEuMTQyLTEuNjkxLDEuMTQyLTIuNzkydi04LjE4NmMwLTEuMDQ3LTAuMzc2LTEuOTU4LTEuMTQyLTIuNzUyYy0wLjc2NC0wLjc3OC0xLjY4OS0xLjE2Ny0yLjc4OS0xLjE2N2gtNS45NzMgYy0wLjMyMi0xLjMxNS0wLjcyNS0yLjYzLTEuMjIyLTMuOTMxYy0wLjQ5Ni0xLjMxNi0xLjA2MS0yLjU1LTEuNjkxLTMuNzA2bDQuNjQ1LTQuNzA5YzAuNzc4LTAuNzM4LDEuMTgxLTEuNjM4LDEuMTgxLTIuNzI0IGMwLTEuMDc1LTAuNDAyLTItMS4xODEtMi43OTJMNjYuNjA1LDkuNjc2TDY2LjYwNSw5LjY3NnogTTExMS45MTgsNTMuNjQ5Yy0wLjUwNi0wLjM1NS0xLjA0NC0wLjQ3OS0xLjYyNy0wLjM3NiBjLTAuNTgzLDAuMTAxLTEuMDU3LDAuNDAxLTEuNDAxLDAuOTA0bC0xLjkwOCwyLjcwMmMtMC42ODgtMC4yOTItMS40MDItMC41MjYtMi4xNDQtMC43MjFjLTAuNzM3LTAuMTk0LTEuNDg0LTAuMzQzLTIuMjMxLTAuNDUxIGwtMC42MTYtMy41MzhjLTAuMTA1LTAuNTk2LTAuMzk1LTEuMDYzLTAuODg0LTEuNDA2Yy0wLjQ4Ni0wLjM0My0xLjAyNC0wLjQ1OS0xLjYyMS0wLjM1NGwtNC40NDEsMC43NzQgYy0wLjU2NiwwLjA5OS0xLjAyNSwwLjM5LTEuMzgzLDAuODc5Yy0wLjM1LDAuNDg3LTAuNDc1LDEuMDI3LTAuMzY5LDEuNjI1bDAuNTY0LDMuMjM4Yy0wLjcxMywwLjMwMy0xLjM5NSwwLjY0OC0yLjAzNywxLjAzOCBjLTAuNjU0LDAuMzkyLTEuMjYzLDAuODEyLTEuODI4LDEuMjY0bC0yLjk5NS0yLjA3M2MtMC40NzYtMC4zNTItMC45OTktMC40ODQtMS41OS0wLjM4M2MtMC41ODMsMC4xMDMtMS4wNDYsMC40MDctMS40MDIsMC45MDQgbC0yLjU2NCwzLjY1OWMtMC4zNTQsMC41MDQtMC40NzksMS4wNDQtMC4zNzcsMS42MjNjMC4xMDIsMC41ODUsMC40MDIsMS4wNTcsMC45MDUsMS40MDRsMi43MDMsMS45MDcgYy0wLjI5MiwwLjY4Ny0wLjUyNywxLjQwMi0wLjcyMSwyLjE0NGMtMC4xOTUsMC43MzgtMC4zNDMsMS40ODQtMC40NTIsMi4yMzFsLTMuNTM4LDAuNjE2Yy0wLjU5NiwwLjEwNC0xLjA2MywwLjM5Ni0xLjQwNiwwLjg4NCBjLTAuMzQ0LDAuNDg2LTAuNDU4LDEuMDI1LTAuMzU0LDEuNjIxbDAuNzczLDQuNDQxYzAuMDk5LDAuNTY2LDAuMzg4LDEuMDI2LDAuODgsMS4zODNjMC40ODcsMC4zNSwxLjAyNywwLjQ3NCwxLjYyNCwwLjM2OSBsMy4yMzktMC41NjRjMC4zMDQsMC43MTMsMC42NDgsMS4zOTQsMS4wMzgsMi4wMzljMC4zOTIsMC42NTIsMC44MTUsMS4yNzQsMS4yNzIsMS44NjlsLTIuMDgxLDIuOTUyIGMtMC4zNTMsMC40NzUtMC40ODUsMC45OTktMC4zODMsMS41OWMwLjEwMiwwLjU4MywwLjQwNiwxLjA0NywwLjkwNCwxLjQwMmwzLjY2NSwyLjYwN2MwLjQ5OSwwLjMyNSwxLjAzNiwwLjQzNiwxLjYxOCwwLjMzNCBjMC41ODMtMC4xMDEsMS4wNTktMC4zODksMS40MS0wLjg2MmwxLjg5OS0yLjc0NmMwLjY4OCwwLjI5MywxLjQwMywwLjUyOCwyLjE0NCwwLjcyMWMwLjczOCwwLjE5NCwxLjQ4NCwwLjM0MywyLjIzLDAuNDUgbDAuNjE4LDMuNTRjMC4xMDQsMC41OTcsMC4zOTYsMS4wNjMsMC44ODMsMS40MDRjMC40ODYsMC4zNDQsMS4wMjUsMC40NiwxLjYyMSwwLjM1Nmw0LjQzOS0wLjc3NSBjMC41NjktMC4xLDEuMDI4LTAuMzg5LDEuMzg2LTAuODc5YzAuMzQ5LTAuNDg4LDAuNDc0LTEuMDI1LDAuMzY4LTEuNjI0bC0wLjU2NS0zLjI0MWMwLjcxMy0wLjMwMywxLjM5Ni0wLjY0NiwyLjA0LTEuMDM3IGMwLjY1MS0wLjM5MywxLjI3NC0wLjgxNCwxLjg3LTEuMjdsMi45NTEsMi4wODFjMC40NzUsMC4zNTIsMS4wMDgsMC40ODMsMS42MDQsMC4zNzhjMC42MDQtMC4xMDQsMS4wNjEtMC40MDksMS4zODgtMC45MDEgbDIuNjA5LTMuNjY1YzAuMzI0LTAuNSwwLjQzNS0xLjAzNiwwLjMzMi0xLjYxOGMtMC4xMDEtMC41ODMtMC4zODctMS4wNTktMC44Ni0xLjQxbC0yLjc0OC0xLjg5OSBjMC4yOTQtMC42ODgsMC41MjgtMS40MDMsMC43MjItMi4xNDRjMC4xOTQtMC43MzgsMC4zNDItMS40ODQsMC40NTItMi4yMzJsMy41MzctMC42MTZjMC41OTctMC4xMDQsMS4wNjMtMC4zOTQsMS40MDUtMC44ODMgYzAuMzQ0LTAuNDg4LDAuNDU5LTEuMDI0LDAuMzU1LTEuNjIxbC0wLjc3NS00LjQ0MWMtMC4wOTktMC41NjctMC4zODktMS4wMjUtMC44NzktMS4zODRjLTAuNDg3LTAuMzUxLTEuMDI3LTAuNDczLTEuNjI0LTAuMzY5IGwtMy4yMzksMC41NjVjLTAuMjk5LTAuNjg0LTAuNjQyLTEuMzU4LTEuMDM1LTIuMDE3Yy0wLjM5NS0wLjY2Ny0wLjgxNi0xLjI4My0xLjI2Ny0xLjg1bDIuMDc0LTIuOTk1IGMwLjM1My0wLjQ3NSwwLjQ4NC0wLjk5OCwwLjM4LTEuNTljLTAuMTAxLTAuNTgzLTAuNDA1LTEuMDQ1LTAuOTA0LTEuNDAxTDExMS45MTgsNTMuNjQ5TDExMS45MTgsNTMuNjQ5eiBNOTkuMTYsNjQuOTI5IGMxLjA3MS0wLjE4OCwyLjExOC0wLjE2MiwzLjE0NywwLjA3NWMxLjAyNSwwLjI0NiwxLjk1MywwLjY1NywyLjc3NywxLjIzMWMwLjgyNSwwLjU4MiwxLjUyMywxLjMxNiwyLjEwMSwyLjE5OCBjMC41NzMsMC44ODksMC45NSwxLjg2NSwxLjEzOSwyLjkzNmMwLjE4NywxLjA3MiwwLjE2LDIuMTE5LTAuMDc2LDMuMTVjLTAuMjQ2LDEuMDIzLTAuNjU1LDEuOTQ5LTEuMjMzLDIuNzc2IGMtMC41ODIsMC44MjMtMS4zMTQsMS41MjItMi4xOTYsMi4xYy0wLjg4OSwwLjU3My0xLjg2NSwwLjk1MS0yLjkzNywxLjEzOWMtMS4wNywwLjE4Ni0yLjExNywwLjE1OS0zLjE0OC0wLjA3NyBjLTEuMDI1LTAuMjQ2LTEuOTUtMC42NTUtMi43NzctMS4yMzJjLTAuODIyLTAuNTgyLTEuNTIyLTEuMzE0LTIuMS0yLjE5NmMtMC41NzItMC44ODktMC45NTItMS44NjYtMS4xMzgtMi45MzcgYy0wLjE4OC0xLjA3LTAuMTYyLTIuMTE3LDAuMDc1LTMuMTQ4YzAuMjQ2LTEuMDI1LDAuNjU3LTEuOTUxLDEuMjMxLTIuNzc4YzAuNTgzLTAuODIxLDEuMzE2LTEuNTIxLDIuMTk4LTIuMDk5IEM5Ny4xMTQsNjUuNDk0LDk4LjA5LDY1LjExNiw5OS4xNiw2NC45MjlMOTkuMTYsNjQuOTI5eiBNNDAuMjYyLDI0LjIyNGMyLjIwMSwwLDQuMjgsMC40MTcsNi4yNTIsMS4yNDggYzEuOTYxLDAuODQ2LDMuNjY2LDEuOTg2LDUuMTE1LDMuNDIxYzEuNDM1LDEuNDQ5LDIuNTc1LDMuMTU2LDMuNDIxLDUuMTEzYzAuODMzLDEuOTczLDEuMjQ4LDQuMDU0LDEuMjQ4LDYuMjU0IGMwLDIuMjAxLTAuNDE1LDQuMjgyLTEuMjQ4LDYuMjU0Yy0wLjg0NiwxLjk1OS0xLjk4NiwzLjY2Ni0zLjQyMSw1LjExNWMtMS40NDksMS40MzYtMy4xNTQsMi41NzUtNS4xMTUsMy40MjEgYy0xLjk3MiwwLjgzMy00LjA1MSwxLjI0OC02LjI1MiwxLjI0OHMtNC4yODItMC40MTUtNi4yNTUtMS4yNDhjLTEuOTU4LTAuODQ2LTMuNjY0LTEuOTg1LTUuMTEyLTMuNDIxIGMtMS40MzctMS40NDktMi41NzctMy4xNTUtMy40MjMtNS4xMTVjLTAuODMxLTEuOTcyLTEuMjQ4LTQuMDUzLTEuMjQ4LTYuMjU0YzAtMi4yLDAuNDE3LTQuMjgxLDEuMjQ4LTYuMjU0IGMwLjg0Ni0xLjk1OCwxLjk4Ni0zLjY2NCwzLjQyMy01LjExM2MxLjQ0OC0xLjQzNSwzLjE1NC0yLjU3Niw1LjExMi0zLjQyMUMzNS45NzksMjQuNjQxLDM4LjA2MSwyNC4yMjQsNDAuMjYyLDI0LjIyNCBMNDAuMjYyLDI0LjIyNHoiLz48L2c+PC9zdmc+";
  const logoShare = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0Ij4KICAgIDxwYXRoIGQ9Ik0yNjIuNCAyNjIuNGwxMTUuMiAwIDAgMTE1LjItMTE1LjIgMCAwLTExNS4yWiI+PC9wYXRoPgogICAgPHBhdGggZD0iTTI2Mi40IDY0Ni40bDExNS4yIDAgMCAxMTUuMi0xMTUuMiAwIDAtMTE1LjJaIj48L3BhdGg+CiAgICA8cGF0aCBkPSJNNjQ2LjQgMjYyLjRsMTE1LjIgMCAwIDExNS4yLTExNS4yIDAgMC0xMTUuMloiPjwvcGF0aD4KICAgIDxwYXRoIGQ9Ik04MDYuNCA4MDYuNGwtMTE1LjIgMCAwIDU3LjYgMTE1LjIgMGMzMiAwIDU3LjYtMjUuNiA1Ny42LTU3LjZsMC01Ny42LTU3LjYgMEw4MDYuNCA4MDYuNHoiPjwvcGF0aD4KICAgIDxwYXRoIGQ9Ik0xNjAgMjE3LjZsMCAyNjIuNCAzMjAgMCAwLTMyMEwyMTcuNiAxNjBDMTg1LjYgMTYwIDE2MCAxODUuNiAxNjAgMjE3LjZ6TTQyMi40IDQyMi40IDIxNy42IDQyMi40IDIxNy42IDIxNy42bDIwNC44IDBMNDIyLjQgNDIyLjR6IiBwLWlkPSIyOTA1Ij48L3BhdGg+PHBhdGggZD0iTTE2MCA4MDYuNGMwIDMyIDI1LjYgNTcuNiA1Ny42IDU3LjZsMjYyLjQgMCAwLTMyMC0zMjAgMEwxNjAgODA2LjR6TTIxNy42IDYwMS42bDIwNC44IDAgMCAyMDQuOEwyMTcuNiA4MDYuNCAyMTcuNiA2MDEuNnoiIHAtaWQ9IjI5MDYiPjwvcGF0aD48cGF0aCBkPSJNNTQ0IDU0NGwyMDQuOCAwIDAgNTcuNi0yMDQuOCAwIDAtNTcuNloiIHAtaWQ9IjI5MDciPjwvcGF0aD48cGF0aCBkPSJNNjkxLjIgNjI3LjIgNjI3LjIgNjI3LjIgNjI3LjIgNjkxLjIgNjkxLjIgNjkxLjIgNjkxLjIgNzQ4LjggNzQ4LjggNzQ4LjggNzQ4LjggNjkxLjIgODY0IDY5MS4yIDg2NCA2MjcuMiA3NDguOCA2MjcuMloiIHAtaWQ9IjI5MDgiPjwvcGF0aD48cGF0aCBkPSJNNTQ0IDc0OC44bDU3LjYgMCAwIDExNS4yLTU3LjYgMCAwLTExNS4yWiIgcC1pZD0iMjkwOSI+PC9wYXRoPjxwYXRoIGQ9Ik02MjcuMiA3NDguOGw1Ny42IDAgMCA1Ny42LTU3LjYgMCAwLTU3LjZaIiBwLWlkPSIyOTEwIj48L3BhdGg+PHBhdGggZD0iTTU0NCA2MjcuMmw1Ny42IDAgMCA1Ny42LTU3LjYgMCAwLTU3LjZaIiBwLWlkPSIyOTExIj48L3BhdGg+PHBhdGggZD0iTTgwNi40IDU0NGw1Ny42IDAgMCA1Ny42LTU3LjYgMCAwLTU3LjZaIiBwLWlkPSIyOTEyIj48L3BhdGg+PHBhdGggZD0iTTgwNi40IDE2MCA1NDQgMTYwbDAgMzIwIDMyMCAwTDg2NCAyMTcuNkM4NjQgMTg1LjYgODM4LjQgMTYwIDgwNi40IDE2MHpNODA2LjQgNDIyLjQgNjAxLjYgNDIyLjQgNjAxLjYgMjE3LjZsMjA0LjggMEw4MDYuNCA0MjIuNHoiPjwvcGF0aD4KPC9zdmc+";
  class ActionMenu {
    constructor() {
      __publicField(this, "actionMenu");
      __publicField(this, "actionPin");
      __publicField(this, "actionConnect");
      __publicField(this, "actionConfig");
      __publicField(this, "actionShare");
      this.actionMenu = document.createElement("div");
      this.actionMenu.className = "gps-action";
      this.actionPin = document.createElement("div");
      this.actionPin.className = "maps-menu gps-pin";
      this.actionPin.title = "내 위치로 이동";
      this.actionPin.innerHTML = `<svg viewBox="0 0 1024 1024"><path d="M176 478.208l275.328 91.733333c1.28 0.426667 2.261333 1.408 2.688 2.688l91.733333 275.328a4.266667 4.266667 0 0 0 7.978667 0.341334l279.381333-651.861334a4.266667 4.266667 0 0 0-5.589333-5.589333L175.658667 470.186667a4.266667 4.266667 0 0 0 0.341333 7.978666z"></path></svg>
        <p>따라가기</p>`;
      this.actionMenu.append(this.actionPin);
      this.actionConnect = document.createElement("div");
      this.actionConnect.className = "maps-menu gps-connect";
      this.actionConnect.title = "플러그인 연결";
      this.actionConnect.innerHTML = `<img src=${logoConnect} alt="Load" class="gps-action-icon" /><p>실시간 연결</p>`;
      this.actionMenu.append(this.actionConnect);
      this.actionConfig = document.createElement("div");
      this.actionConfig.className = "maps-menu gps-config hide";
      this.actionConfig.title = "설정";
      this.actionConfig.innerHTML = `<img src=${logoSettigns} alt="Load" class="gps-action-icon" /><p>설정</p>`;
      this.actionMenu.append(this.actionConfig);
      this.actionShare = document.createElement("div");
      this.actionShare.className = "maps-menu gps-share";
      this.actionShare.style.display = "none";
      this.actionShare.title = "멀티스크린 공유";
      this.actionShare.innerHTML = `<img src=${logoShare} alt="QR Code" class="gps-action-icon" /><p>멀티스크린</p>`;
      const actionShareDot = document.createElement("div");
      actionShareDot.className = "gps-share-dot";
      actionShareDot.innerText = "0";
      this.actionShare.append(actionShareDot);
      this.actionMenu.append(this.actionShare);
    }
  }
  function isMobileBrowser() {
    const a = navigator.userAgent;
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
  }
  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  async function fetchWithTimeout(url, options) {
    const { timeout } = options || 8e3;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  }
  async function generateHashNumber(key) {
    const msgUint8 = new TextEncoder().encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.reduce((a, b) => a + b);
    return hashHex;
  }
  class Dialog {
    constructor() {
      __publicField(this, "dialog");
      __publicField(this, "dialogTitle");
      __publicField(this, "dialogContentText");
      __publicField(this, "dialogMinimize");
      __publicField(this, "dialogClose");
      __publicField(this, "dialogContentProgress");
      __publicField(this, "dialogContentProgressIn");
      __publicField(this, "_isShowing", false);
      __publicField(this, "_isMinimized", false);
      __publicField(this, "_isProgressing", false);
      __publicField(this, "_callerFunction", null);
      __publicField(this, "_contentMessageHashNumber", 0);
      this.dialog = document.createElement("div");
      this.dialog.className = "gps-dialog";
      const dialogHeader = document.createElement("div");
      dialogHeader.className = "gps-dialog-header";
      this.dialog.appendChild(dialogHeader);
      this.dialogTitle = document.createElement("h3");
      this.dialogTitle.className = "gps-dialog-title";
      dialogHeader.append(this.dialogTitle);
      this.dialogMinimize = document.createElement("div");
      this.dialogMinimize.className = "gps-dialog-minimize";
      this.dialogMinimize.addEventListener("click", this.minimizeDialog);
      dialogHeader.append(this.dialogMinimize);
      this.dialogClose = document.createElement("div");
      this.dialogClose.className = "gps-dialog-close";
      this.dialogClose.innerHTML = "&#215;";
      this.dialogClose.addEventListener("click", (e) => this.closeDialog(e, "", null));
      dialogHeader.append(this.dialogClose);
      const dialogContent = document.createElement("div");
      dialogContent.className = "gps-dialog-content";
      this.dialog.append(dialogContent);
      this.dialogContentText = document.createElement("div");
      this.dialogContentText.className = "gps-dialog-content-text";
      dialogContent.append(this.dialogContentText);
      this.dialogContentProgress = document.createElement("div");
      this.dialogContentProgress.className = "gps-dialog-progress";
      dialogContent.append(this.dialogContentProgress);
      this.dialogContentProgressIn = document.createElement("div");
      this.dialogContentProgressIn.className = "gps-dialog-progress-in";
      this.dialogContentProgress.append(this.dialogContentProgressIn);
    }
    alertDialog(title, content, callerFunc = null, closable = false) {
      this.dialogTitle.innerText = title;
      this.dialogContentText.innerText = content;
      this.dialog.classList.add("show");
      this.dialogClose.style.display = closable ? "block" : "none";
      this._isShowing = true;
      this._callerFunction = callerFunc;
      generateHashNumber(content).then((hn) => {
        this._contentMessageHashNumber = hn;
      });
    }
    closeDialog(event, content = "", callerFunc = null) {
      if (event == null || callerFunc != null) {
        generateHashNumber(content).then((hn) => {
          if (this._contentMessageHashNumber != hn)
            return;
          if (this._callerFunction == callerFunc) {
            this.dialog.classList.remove("show");
            this._isShowing = false;
          }
        });
      } else {
        this.dialog.classList.remove("show");
        this._isShowing = false;
      }
    }
    minimizeDialog(_event) {
      this.dialog.classList.add("minimized");
      this._isMinimized = true;
    }
    showProgress() {
      this.dialogContentProgress.style.display = "block";
      this.dialogContentProgressIn.style.width = "0%";
      this._isProgressing = true;
    }
    changeProgress(percent) {
      if (this._isProgressing)
        this.dialogContentProgressIn.style.width = `${percent}%`;
    }
    hideProgress() {
      this.dialogContentProgress.style.display = "none";
      this.dialogContentProgressIn.style.width = "0%";
      this._isProgressing = false;
    }
    get isShowing() {
      return this._isShowing;
    }
    get isMinimized() {
      return this._isMinimized;
    }
    get isProgressing() {
      return this._isProgressing;
    }
  }
  class UserMarker {
    constructor() {
      __publicField(this, "userMarker");
      __publicField(this, "userMarkerIcon");
      this.userMarker = document.createElement("div");
      this.userMarker.classList.add("gps-user-marker");
      this.userMarker.style.transformOrigin = "center";
      this.userMarkerIcon = document.createElement("div");
      this.userMarkerIcon.classList.add("gps-user-position");
      this.userMarker.appendChild(this.userMarkerIcon);
    }
  }
  async function loadCvat(debug = false) {
    const params = new Array();
    if (debug)
      params.push("debug");
    params.push("launch");
    const launchBase = "genshin-paisitioning://";
    let launchUrl = `${launchBase}${params.join("/")}`;
    try {
      const a = document.createElement("a");
      a.href = launchUrl;
      a.click();
    } catch (e) {
      console.error(e);
    }
  }
  const _WebSocketManager = class {
    constructor() {
      __publicField(this, "socket");
      __publicField(this, "onSocketConnectPost", () => {
      });
      __publicField(this, "onTrackEvent", () => {
      });
      __publicField(this, "onGetConfig", () => {
      });
      __publicField(this, "onLibUpdateProgress", () => {
      });
      __publicField(this, "onLibUpdateDone", () => {
      });
      __publicField(this, "onLibInit", () => {
      });
      this.socket = null;
    }
    static get instance() {
      if (!_WebSocketManager._instance)
        _WebSocketManager._instance = new _WebSocketManager();
      return _WebSocketManager._instance;
    }
    async getSocket() {
      let i = 0;
      while (i++ < 10 && (!this.socket || this.socket.readyState !== WebSocket.OPEN && this.socket.readyState !== WebSocket.CONNECTING)) {
        let res;
        try {
          res = await fetchWithTimeout("http://localhost:32332/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ user_id: !isMobileBrowser ? 1 : 2 }),
            timeout: 8e3
          });
          if (res.ok) {
            const connectionURL = await res.json();
            this.socket = new WebSocket(connectionURL.url);
            this.socket.addEventListener("open", (e) => this.onWsOpen(e));
            this.socket.addEventListener("message", (e) => this.onWsMessage(e));
            this.socket.addEventListener("error", (e) => this.onWsError(e));
            this.socket.addEventListener("close", (e) => this.onWsClose(e));
            return this.socket;
          } else {
            await delay(3e3);
            continue;
          }
        } catch (e) {
          await delay(3e3);
          continue;
        }
      }
      return this.socket;
    }
    closeSocket() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
    isSocketOpen() {
      if (this.socket instanceof WebSocket) {
        if (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN) {
          return true;
        }
      }
      return false;
    }
    onWsOpen(event) {
      if ((event == null ? void 0 : event.currentTarget) instanceof WebSocket)
        event.currentTarget.send(JSON.stringify({ event: "checkLibUpdate" }));
      this.onSocketConnectPost(event);
    }
    onWsMessage(event) {
      const msg = JSON.parse(event.data);
      if ((msg == null ? void 0 : msg.event) == "track") {
        msg.data.err = msg.data.err != "" ? JSON.parse(msg.data.err) : null;
        msg.data = msg.data;
        this.onTrackEvent(event, msg.data);
      } else if ((msg == null ? void 0 : msg.event) == "update") {
        this.onUpdateEvent(event, msg.data);
      } else if ((msg == null ? void 0 : msg.event) == "config") {
        this.onConfigEvent(event, msg.data);
      }
    }
    onWsError(event) {
      console.debug("============= WebSocket Error =============");
      console.debug(`error: ${event}`);
      console.debug("===========================================");
    }
    onWsClose(event) {
      console.debug("============= WebSocket Closed =============");
      console.debug(`code: ${event.code}`);
      console.debug(`reason: ${event.reason}`);
      console.debug("============================================");
    }
    onConfigEvent(event, data) {
      this.onGetConfig(event, data);
      if ((event == null ? void 0 : event.currentTarget) instanceof WebSocket) {
        this.onLibInit(event, data);
        event.currentTarget.send(JSON.stringify({ event: "init" }));
      }
    }
    onUpdateEvent(event, data) {
      if (data.done) {
        if ((event == null ? void 0 : event.currentTarget) instanceof WebSocket) {
          event.currentTarget.send(JSON.stringify({ event: "getConfig" }));
        }
        this.onLibUpdateDone(event, data);
      } else {
        this.onLibUpdateProgress(event, data);
      }
    }
    sendConfig(config) {
      if (this.socket) {
        this.socket.send(JSON.stringify({ event: "setConfig", data: config }));
      }
    }
  };
  let WebSocketManager = _WebSocketManager;
  __publicField(WebSocketManager, "_instance");
  const _ConfigModal = class {
    constructor(config) {
      __publicField(this, "config");
      __publicField(this, "configItems", []);
      __publicField(this, "modal");
      __publicField(this, "btnSave");
      __publicField(this, "btnCancel");
      __publicField(this, "onSaveConfig", () => {
      });
      this.config = config;
      for (const key in config) {
        let label = "";
        if (key === "autoAppUpdate")
          label = "앱 자동 업데이트";
        else if (key === "autoLibUpdate")
          label = "라이브러리 자동 업데이트";
        else if (key === "captureInterval")
          label = "화면 캡쳐 간격";
        else if (key === "captureDelayOnError")
          label = "캡쳐 에러 시 대기 시간";
        else if (key === "useBitBltCaptureMode")
          label = "비트블럭 캡쳐 모드 사용";
        this.configItems.push({
          configKey: key,
          label,
          defaultValue: config[key],
          type: typeof config[key]
        });
      }
      this.modal = document.createElement("div");
      this.modal.className = "gps-config-modal";
      const modalContent = document.createElement("div");
      modalContent.className = "gps-config-modal-content";
      this.modal.appendChild(modalContent);
      const modalContentHeader = document.createElement("div");
      modalContentHeader.className = "gps-config-modal-content-header";
      modalContent.appendChild(modalContentHeader);
      const modalTitle = document.createElement("h2");
      modalTitle.className = "gps-config-modal-title";
      modalTitle.innerText = "설정";
      modalContentHeader.appendChild(modalTitle);
      const modalClose = document.createElement("div");
      modalClose.className = "gps-config-close";
      modalClose.innerHTML = "&times;";
      modalContentHeader.appendChild(modalClose);
      const modalContentBody = document.createElement("div");
      modalContentBody.className = "gps-config-modal-content-body";
      modalContent.appendChild(modalContentBody);
      this.configItems.forEach((item, index) => {
        const configItem = document.createElement("div");
        configItem.className = "gps-config-item";
        modalContentBody.appendChild(configItem);
        const configItemLabel = document.createElement("label");
        configItemLabel.className = "gps-config-item-label";
        configItemLabel.innerText = item.label;
        configItemLabel.htmlFor = `gps-config-${index}`;
        configItem.appendChild(configItemLabel);
        if (item.type === "boolean") {
          const configItemValue = document.createElement("label");
          configItemValue.className = "gps-config-value gps-config-switch";
          configItem.appendChild(configItemValue);
          const configItemInput = document.createElement("input");
          configItemInput.id = `gps-config-${index}`;
          configItemInput.type = "checkbox";
          configItemInput.checked = item.defaultValue;
          configItemInput.addEventListener("change", (e) => {
            const target = e.target;
            this.config[item.configKey] = target.checked;
          });
          configItemValue.appendChild(configItemInput);
          const configToggleSlider = document.createElement("span");
          configToggleSlider.className = "gps-config-slider";
          configItemValue.appendChild(configToggleSlider);
        } else if (item.type === "number") {
          const configItemValue = document.createElement("div");
          configItemValue.className = "gps-config-value";
          configItem.appendChild(configItemValue);
          const configItemInput = document.createElement("input");
          configItemInput.className = "gps-config-item-input";
          configItemInput.id = `gps-config-${index}`;
          configItemInput.type = item.type;
          configItemInput.min = "100";
          configItemInput.max = "60000";
          configItemInput.value = item.defaultValue;
          configItemInput.maxLength = 5;
          configItemInput.addEventListener("change", (e) => {
            const target = e.target;
            this.config[item.configKey] = parseInt(target.value);
          });
          configItemValue.appendChild(configItemInput);
        }
      });
      const modalContentFooter = document.createElement("div");
      modalContentFooter.className = "gps-config-modal-content-footer";
      modalContent.appendChild(modalContentFooter);
      this.btnSave = document.createElement("button");
      this.btnSave.className = "gps-config-btn save";
      this.btnSave.innerText = "저장";
      modalContentFooter.appendChild(this.btnSave);
      this.btnCancel = document.createElement("button");
      this.btnCancel.className = "gps-config-btn cancel";
      this.btnCancel.innerText = "취소";
      modalContentFooter.appendChild(this.btnCancel);
      document.body.appendChild(this.modal);
      modalClose.addEventListener("click", () => {
        this.hideModal();
      });
      this.btnCancel.addEventListener("click", () => {
        this.hideModal();
      });
      this.btnSave.addEventListener("click", () => {
        this.hideModal();
        this.onSaveConfig(this.config);
      });
    }
    static getInstance(config) {
      if (!_ConfigModal._instance)
        _ConfigModal._instance = new _ConfigModal(config);
      return _ConfigModal._instance;
    }
    showModal(_e) {
      this.modal.classList.add("show");
    }
    hideModal() {
      this.modal.classList.remove("show");
    }
  };
  let ConfigModal = _ConfigModal;
  __publicField(ConfigModal, "_instance");
  class Config {
    constructor(config) {
      __publicField(this, "_config");
      __publicField(this, "modal");
      __publicField(this, "onConfigChanged", () => {
      });
      this._config = config;
      this.modal = ConfigModal.getInstance(this._config);
      this.modal.onSaveConfig = (config2) => {
        this.config = config2;
      };
    }
    set config(config) {
      this._config = config;
      this.onConfigChanged(this._config);
    }
    get config() {
      return this._config;
    }
  }
  const _MapSite = class {
    constructor() {
      __publicField(this, "root");
      __publicField(this, "dialog");
      __publicField(this, "actionMenu");
      __publicField(this, "userMarker");
      __publicField(this, "config");
      __publicField(this, "siteHost");
      __publicField(this, "isPinned");
      __publicField(this, "currentMap");
      __publicField(this, "ws");
      __publicField(this, "mapElement", null);
      __publicField(this, "_loadAbortController", new AbortController());
      __publicField(this, "_loadAbortSignal", this._loadAbortController.signal);
      this.root = document.createElement("div");
      this.root.id = "gps-root";
      this.siteHost = location.host;
      this.root.classList.add(this.siteHost.replace(/\./g, "-"));
      this.actionMenu = new ActionMenu();
      this.root.appendChild(this.actionMenu.actionMenu);
      this.dialog = new Dialog();
      this.root.appendChild(this.dialog.dialog);
      this.userMarker = new UserMarker();
      this.ws = WebSocketManager.instance;
      this.ws.onGetConfig = (e, d) => this.onGetConfig(e, d);
      this.actionMenu.actionConnect.addEventListener("click", (e) => this.onClickLoadPluginBtn(e, false), { signal: this._loadAbortSignal });
      this.actionMenu.actionConnect.addEventListener("contextmenu", (e) => this.onClickLoadPluginBtn(e, true), { signal: this._loadAbortSignal });
      this.actionMenu.actionPin.addEventListener("click", (e) => this.onClickPinBtn(e));
      this.actionMenu.actionPin.addEventListener("contextmenu", (e) => this.onRightClickPinBtn(e));
      this.isPinned = true;
      if (this.isPinned) {
        this.userMarker.userMarker.classList.add("gps-pinned");
        this.actionMenu.actionPin.classList.add("gps-active");
      }
      this.currentMap = 0;
    }
    static get instance() {
      if (!__privateGet(_MapSite, _instance))
        __privateSet(_MapSite, _instance, new _MapSite());
      return __privateGet(_MapSite, _instance);
    }
    onClickLoadPluginBtn(event, debug) {
      this._loadAbortController.abort();
      event.preventDefault();
      event.stopPropagation();
      loadCvat(debug);
      this.ws.getSocket().then((socket) => {
        if (socket == null) {
          this.dialog.alertDialog("GPS", "GPA에 연결할 수 없습니다. 앱이 켜져있는지 확인해주세요.");
          this._loadAbortController = new AbortController();
          this._loadAbortSignal = this._loadAbortController.signal;
          this.actionMenu.actionConnect.addEventListener("click", (e) => this.onClickLoadPluginBtn(e, false), { signal: this._loadAbortSignal });
          this.actionMenu.actionConnect.addEventListener("contextmenu", (e) => this.onClickLoadPluginBtn(e, true), { signal: this._loadAbortSignal });
        }
      });
    }
    onClickPinBtn(event) {
      event.preventDefault();
      event.stopPropagation();
      this.togglePin();
    }
    onRightClickPinBtn(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onGetConfig(_event, config) {
      this.config = new Config({
        autoAppUpdate: _GM_getValue("autoAppUpdate", true),
        autoLibUpdate: _GM_getValue("autoLibUpdate", true),
        captureInterval: config.captureInterval,
        captureDelayOnError: config.captureDelayOnError,
        useBitBltCaptureMode: config.useBitBltCaptureMode
      });
      this.actionMenu.actionConfig.classList.remove("hide");
      this.actionMenu.actionConfig.addEventListener("click", (e) => this.config.modal.showModal(e));
      this.config.onConfigChanged = (c) => this.onConfigChanged(c);
    }
    onConfigChanged(config) {
      _GM_setValue("autoAppUpdate", config.autoAppUpdate);
      _GM_setValue("autoLibUpdate", config.autoLibUpdate);
      this.ws.sendConfig(config);
    }
    setFocusScroll(_x, _y) {
    }
    appendUserMarker(parent) {
      parent.appendChild(this.userMarker.userMarker);
    }
    setPinned(p) {
      this.isPinned = p;
      if (this.isPinned) {
        this.actionMenu.actionPin.classList.add("gps-active");
        if (this.userMarker.userMarker) {
          this.userMarker.userMarker.classList.add("gps-pinned");
          let x, y;
          let t, s, l, c;
          t = "translate";
          s = this.userMarker.userMarker.style["transform"].indexOf(t) + t.length + 1;
          l = this.userMarker.userMarker.style["transform"].indexOf(")", s);
          c = this.userMarker.userMarker.style["transform"].substring(s, l);
          if (c) {
            [x, y] = c.split(", ");
            x = parseInt(x);
            y = parseInt(y);
            this.setFocusScroll(x, y);
          }
        }
      } else {
        this.actionMenu.actionPin.classList.remove("gps-active");
        if (this.userMarker.userMarker)
          this.userMarker.userMarker.classList.remove("gps-pinned");
      }
    }
    togglePin() {
      this.setPinned(!this.isPinned);
    }
    drawUserIcon() {
      const userIcon = document.createElement("div");
      userIcon.className = "gps-user-icon";
      this.root.appendChild(userIcon);
    }
  };
  let MapSite = _MapSite;
  _instance = new WeakMap();
  __privateAdd(MapSite, _instance, void 0);
  function overrideFuntions(site) {
    const Hooked_drawMapsScale = _unsafeWindow.drawMapsScale;
    _unsafeWindow.drawMapsScale = function(args) {
      var ret = Hooked_drawMapsScale.apply(this, [args]);
      let o = site.userMarker.userMarker.style["transform"];
      let t, s, l, c;
      t = "scale";
      s = o.indexOf(t) + "scale".length + 1;
      l = o.indexOf(")", s);
      c = o.substring(s, l - s);
      let setValues = [_unsafeWindow.MAPS_PointScale];
      site.userMarker.userMarker.style["transform"] = o.substring(0, s) + setValues.join(", ") + o.substring(s + c.length);
      return ret;
    };
    const Hooked_changeMapsType = _unsafeWindow.changeMapsType;
    _unsafeWindow.changeMapsType = function(args) {
      var ret = Hooked_changeMapsType.apply(this, [args]);
      site.onChangeMap.apply(this, [args]);
      return ret;
    };
  }
  const _GamedotMaps = class extends MapSite {
    constructor() {
      super();
      __publicField(this, "objectPanelMenu", null);
      __publicField(this, "objectTargetFilterBtn", null);
      __publicField(this, "mapInfo");
      __publicField(this, "mcEnsure");
      __publicField(this, "focusPos", [0, 0]);
      __publicField(this, "tmpDragging", -1);
      __publicField(this, "tmpMousePos", [0, 0]);
      const menu = document.getElementById("mapsMenu");
      if (menu instanceof HTMLDivElement)
        this.objectPanelMenu = menu;
      const objectTargetFilter = document.getElementById("mapsAreaFilter");
      if (objectTargetFilter instanceof HTMLDivElement)
        this.objectTargetFilterBtn = objectTargetFilter.querySelector("div[data-value='unset']");
      this.userMarker.userMarker.style.transform = `translate(${_unsafeWindow.MAPS_RelativeX}px, ${_unsafeWindow.MAPS_RelativeY}px) scale(${_unsafeWindow.MAPS_PointScale})`;
      if (_unsafeWindow.objectLayerPin instanceof HTMLDivElement)
        this.appendUserMarker(_unsafeWindow.objectLayerPin);
      this.mapElement = _unsafeWindow.objectViewer;
      this.mapInfo = /* @__PURE__ */ new Map([[0, "teyvat"], [1, "enkanomiya"], [2, "underground-mines"]]);
      this.mcEnsure = 0;
      this.ws.onTrackEvent = (e, d) => this.mapOnPos(e, d);
      this.ws.onLibUpdateProgress = (e, d) => this.onLibUpdateProgress(e, d);
      this.ws.onLibUpdateDone = (e, d) => this.onLibUpdateDone(e, d);
      this.ws.onLibInit = (e, d) => this.onLibInit(e, d);
      if (_unsafeWindow.objectViewer instanceof HTMLDivElement) {
        _unsafeWindow.objectViewer.addEventListener("mousedown", (e) => this.onMouseTouchDown(e));
        _unsafeWindow.objectViewer.addEventListener("touchstart", (e) => this.onMouseTouchDown(e));
        _unsafeWindow.objectViewer.addEventListener("mouseup", (e) => this.onMouseTouchUp(e));
        _unsafeWindow.objectViewer.addEventListener("touchend", (e) => this.onMouseTouchUp(e));
        _unsafeWindow.objectViewer.addEventListener("mousemove", (e) => this.onMouseTouchMove(e));
        _unsafeWindow.objectViewer.addEventListener("touchmove", (e) => this.onMouseTouchMove(e));
      }
      overrideFuntions(this);
    }
    static get instance() {
      if (!__privateGet(_GamedotMaps, _instance2))
        __privateSet(_GamedotMaps, _instance2, new _GamedotMaps());
      return __privateGet(_GamedotMaps, _instance2);
    }
    setFocusScroll(x, y) {
      if (_unsafeWindow.objectLayerBase instanceof HTMLDivElement && _unsafeWindow.objectViewer instanceof HTMLDivElement) {
        let baseView = _unsafeWindow.objectLayerBase.getClientRects()[0];
        let nowView = _unsafeWindow.objectViewer.getClientRects()[0];
        var viewWidth = _unsafeWindow.MAPS_Size / 100 * (nowView.width / (baseView.width / 100));
        var viewHeight = _unsafeWindow.MAPS_Size / 100 * (nowView.height / (baseView.height / 100));
        var scrollX = (x - viewWidth / 2) / 100 * _unsafeWindow.MAPS_Scale;
        var scrollY = (y - viewHeight / 2) / 100 * _unsafeWindow.MAPS_Scale;
        _unsafeWindow.objectViewer.scrollTo({ top: scrollY, left: scrollX, behavior: "smooth" });
      }
    }
    setFocusPoint(x, y) {
      if (_unsafeWindow.objectLayerBase instanceof HTMLDivElement && _unsafeWindow.objectViewer instanceof HTMLDivElement) {
        x = x + _unsafeWindow.MAPS_RelativeX;
        y = y + _unsafeWindow.MAPS_RelativeY;
        var baseView = _unsafeWindow.objectLayerBase.getClientRects()[0];
        var nowView = _unsafeWindow.objectViewer.getClientRects()[0];
        var viewWidth = _unsafeWindow.MAPS_Size / 100 * (nowView.width / (baseView.width / 100));
        var viewHeight = _unsafeWindow.MAPS_Size / 100 * (nowView.height / (baseView.height / 100));
        var scrollX = (x - viewWidth / 2) / 100 * _unsafeWindow.MAPS_Scale;
        var scrollY = (y - viewHeight / 2) / 100 * _unsafeWindow.MAPS_Scale;
        _unsafeWindow.objectViewer.scrollTo({ top: scrollY, left: scrollX, behavior: "smooth" });
      }
    }
    mapOnPos(_event, posobj) {
      document.body.classList.add("gps-activated");
      this.actionMenu.actionConnect.classList.add("gps-active");
      let { m, x, y, r: rot, a: dir, err } = posobj;
      if (err) {
        this.dialog.alertDialog("GPS", "위치를 얻는 도중 오류가 발생했습니다.", this.mapOnPos.name, true);
        return;
      }
      if (this.dialog.isShowing) {
        this.dialog.closeDialog(null, "위치를 얻는 도중 오류가 발생했습니다.", this.mapOnPos.name);
      }
      if (this.currentMap !== m) {
        if (this.mcEnsure < 10) {
          this.mcEnsure = this.mcEnsure + 1;
        } else {
          this.mcEnsure = 0;
          this.currentMap = m;
          if (this.mapInfo.has(this.currentMap)) {
            const mapName = this.mapInfo.get(this.currentMap);
            if (mapName)
              this.onPlayerMovedMap(mapName);
          } else {
            this.dialog.alertDialog("GPS", "알 수 없는 지도입니다.", this.mapOnPos.name, true);
          }
        }
      } else {
        const pos = [y, x];
        switch (this.currentMap) {
          case 0:
            pos[0] = (pos[0] + 5890) / 2;
            pos[1] = (pos[1] - 2285) / 2;
            break;
          case 1:
            pos[0] = pos[0] * 1.275 - 670;
            pos[1] = pos[1] * 1.275 - 2247;
            break;
          case 2:
            pos[0] = pos[0] * 1.275 - 225;
            pos[1] = pos[1] * 1.275 - 2060;
            break;
          default:
            pos[0] = (pos[0] + 5890) / 2;
            pos[1] = (pos[1] - 2285) / 2;
        }
        let rpos = [pos[0], pos[1]];
        rpos[0] = pos[0] + _unsafeWindow.MAPS_RelativeY - 13;
        rpos[1] = pos[1] + _unsafeWindow.MAPS_RelativeX - 8;
        if (this.isPinned) {
          let distance = Math.pow(this.focusPos[0] - pos[0], 2) + Math.pow(this.focusPos[1] - pos[1], 2);
          distance = Math.sqrt(distance);
          if (distance > 15) {
            this.focusPos[0] = pos[0];
            this.focusPos[1] = pos[1];
            this.setFocusPoint(pos[1], pos[0]);
          }
        }
        let o = this.userMarker.userMarker.style["transform"];
        let t, s, l, c;
        t = "translate";
        s = this.userMarker.userMarker.style["transform"].indexOf(t) + t.length + 1;
        l = this.userMarker.userMarker.style["transform"].indexOf(")", s);
        c = this.userMarker.userMarker.style["transform"].substring(s, l);
        let setValues = [Math.round(rpos[1]) + "px", Math.round(rpos[0]) + "px"];
        this.userMarker.userMarker.style["transform"] = o.substring(0, s) + setValues.join(", ") + o.substring(s + c.length);
        this.userMarker.userMarkerIcon.style.setProperty("--dir", 0 - dir + "deg");
        this.userMarker.userMarkerIcon.style.setProperty("--rot", 0 - rot + "deg");
      }
    }
    onPlayerMovedMap(mapName) {
      const objectTab = document.getElementById("mapsAreaFilter");
      if (this.objectTargetFilterBtn instanceof HTMLDivElement)
        this.objectTargetFilterBtn.classList.remove("current-map");
      if (objectTab instanceof HTMLDivElement)
        this.objectTargetFilterBtn = objectTab.querySelector(`div[data-value='${mapName}']`);
      if (this.objectTargetFilterBtn instanceof HTMLDivElement)
        this.objectTargetFilterBtn.classList.add("current-map");
      if (this.userMarker.userMarker) {
        if (_unsafeWindow.MAPS_Type !== mapName) {
          this.userMarker.userMarker.classList.add("hide");
          this.setPinned(false);
          this.dialog.alertDialog("GPS", "플레이어의 현재 위치와 활성화된 지도가 다릅니다.", this.onPlayerMovedMap.name, true);
        } else {
          this.userMarker.userMarker.classList.remove("hide");
          this.dialog.closeDialog(null, "플레이어의 현재 위치와 활성화된 지도가 다릅니다.", this.onPlayerMovedMap.name);
        }
      }
    }
    onChangeMap(strCode, _mapCode = "") {
      if (this.userMarker.userMarker) {
        if (_unsafeWindow.MAPS_Type !== strCode) {
          this.userMarker.userMarker.classList.add("hide");
          this.setPinned(false);
          this.dialog.alertDialog("GPS", "플레이어의 현재 위치와 활성화된 지도가 다릅니다.", this.onChangeMap.name, true);
        } else {
          this.userMarker.userMarker.classList.remove("hide");
          this.dialog.closeDialog(null, "플레이어의 현재 위치와 활성화된 지도가 다릅니다.", this.onChangeMap.name);
        }
        if (this.objectTargetFilterBtn instanceof HTMLDivElement)
          this.objectTargetFilterBtn.classList.remove("current-map");
        const objectTab = document.getElementById("mapsAreaFilter");
        if (objectTab instanceof HTMLDivElement)
          this.objectTargetFilterBtn = objectTab.querySelector(`div[data-value='${this.mapInfo.get(this.currentMap)}']`);
        if (this.objectTargetFilterBtn)
          this.objectTargetFilterBtn.classList.add("current-map");
      }
    }
    setPinned(p) {
      super.setPinned(p);
      if (this.isPinned) {
        if (this.mapInfo.get(this.currentMap) !== _unsafeWindow.MAPS_Type) {
          _unsafeWindow.changeMapsType(this.mapInfo.get(this.currentMap));
        }
      }
    }
    mouseMoveEvent(event) {
      if (_unsafeWindow.MAPS_ViewMobile == true)
        return;
      const rect = this.userMarker.userMarker.getBoundingClientRect();
      let vecX = event.clientX - (rect.left + window.scrollX);
      let vecY = event.clientY - (rect.top + window.scrollY);
      let dist = Math.sqrt(vecX * vecX + vecY * vecY);
      if (dist <= 17.5 / _unsafeWindow.MAPS_PointScale) {
        this.userMarker.userMarker.classList.add("hover");
      } else {
        this.userMarker.userMarker.classList.remove("hover");
      }
    }
    onMouseTouchDown(e) {
      if (!this.ws.isSocketOpen())
        return;
      this.tmpDragging = Date.now();
      if (e instanceof MouseEvent)
        this.tmpMousePos = [e.clientX, e.clientY];
      else if (e instanceof TouchEvent)
        this.tmpMousePos = [e.touches[0].clientX, e.touches[0].clientY];
    }
    onMouseTouchMove(e) {
      if (!this.ws.isSocketOpen())
        return;
      if (this.tmpDragging > 0 && Date.now() - this.tmpDragging > 100) {
        let nowMousePos = [0, 0];
        if (e instanceof MouseEvent)
          nowMousePos = [e.clientX, e.clientY];
        else if (e instanceof TouchEvent)
          nowMousePos = [e.touches[0].clientX, e.touches[0].clientY];
        const diff = [Math.abs(nowMousePos[0] - this.tmpMousePos[0]), Math.abs(nowMousePos[1] - this.tmpMousePos[1])];
        if (diff[0] > 20 || diff[1] > 20)
          this.setPinned(false);
      }
    }
    onMouseTouchUp(_e) {
      if (!this.ws.isSocketOpen())
        return;
      this.tmpDragging = -1;
    }
    onStartLibUpdate(_event, data) {
      this.dialog.alertDialog("GPS", `라이브러리 ${data.targetVersion} 버전 업데이트 중...`, this.onStartLibUpdate.name, false);
      this.dialog.showProgress();
    }
    onLibUpdateProgress(event, data) {
      if (!this.dialog.isProgressing) {
        this.onStartLibUpdate(event, data);
      }
      this.dialog.changeProgress(data.percent);
    }
    onLibUpdateDone(_event, data) {
      if (this.dialog.isShowing && this.dialog.isProgressing) {
        this.dialog.closeDialog(null, `라이브러리 ${data.targetVersion} 버전 업데이트 중...`, this.onStartLibUpdate.name);
        this.dialog.hideProgress();
      }
    }
    onLibInit(_event, _data) {
      document.body.addEventListener("mousemove", (e) => this.mouseMoveEvent(e));
    }
  };
  let GamedotMaps = _GamedotMaps;
  _instance2 = new WeakMap();
  __privateAdd(GamedotMaps, _instance2, void 0);
  (() => {
    const site = GamedotMaps.instance;
    if (site.objectPanelMenu instanceof HTMLDivElement)
      site.objectPanelMenu.appendChild(site.root);
  })();

})();
