/*
    This file is part of the LIREC program developped for the SIMPLES project.
    It was developped by Baptiste Jacquet and Sébastien Poitrenaud for the
    LUTIN-Userlab from 2018 to 2020.
    Copyright (C) 2018  Baptiste Jacquet & Sébastien Poitrenaud

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// data.js

function isMobile() {
	mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
		for (var i in mobile) if (navigator.userAgent.toLowerCase().indexOf(mobile[i]) != -1) return true;
		return false;
}

function jourString(date) {
  var tab_jour = new Array("Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam");
  var ladate = new Date(date);
  return tab_jour[ladate.getDay()];
}
function moisString(date) {
  var tab_mois=new Array("Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc");
  var ladate = new Date(date);
  return tab_mois[ladate.getMonth()];
}

function clearCanvas() {
  plot1.canvasManager.freeAllCanvases();
  plot2.canvasManager.freeAllCanvases();
  plot3.canvasManager.freeAllCanvases();
  plot4.canvasManager.freeAllCanvases();
}

setTimeout( function() {
  clearCanvas();
  //location.href = 'data.php';
  location.reload();
}, 300000);

window.addEventListener("beforeunload", clearCanvas);
window.addEventListener("pagehide", clearCanvas);
window.addEventListener("unload", clearCanvas);

var plot1, plot2, plot3, plot4;


// ********************************************************** R E A D Y
$(document).ready(function () {
  $.jqplot.config.enablePlugins = true;
  $("#nbVisTotal").css({"display": "block",
                        "position": "absolute",
                        "font-size": "2em",
                        "font-weight": "900",
                        "color": "white",
                        "background": "#222",
                        "padding-right": "12px",
                        "padding-left": "12px",
                        "top": "128px",
                        "left": "440px"});

  if ( !data1 || !data2 ) location.href = 'data.php';

  for ( let i=0; i<data1.length; i++ ) {
    let year = data1[i][0].split("-")[0];
    data1[i][0] = moisString(data1[i][0]) + " " + year;
    data1[i][1] = Number(data1[i][1]);
  }
  for ( let i=0; i<data2.length; i++ ) {
    let month = moisString(data2[i][0]);
    let day = jourString(data2[i][0]);
    let num = data2[i][0].split("-")[2];
    data2[i][0] = day + " " + num + " " + month;
    data2[i][1] = Number(data2[i][1]);
  }
  for ( let couple of data3 ) {
    couple[1] = Number(couple[1]);
  }
  for ( let couple of data4 ) {
    couple[1] = Number(couple[1]);
  }

  // -------------------------------------------------------------------
  plot1 = $.jqplot ('chart1', [data1], {
          seriesColors: ['rgba(88, 205, 128, 1)'],
          title: {
            rendererOptions: {
              text: '<strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Visites des 30 derniers mois</strong>',
              fontSize: '24px',
              textAlign: 'left',
              textColor: '#222'
            }
          },
          seriesDefaults: {
            //renderer: $.jqplot.BarRenderer,
            pointLabels: {
              show: true,
              ypadding: 10
            },
            rendererOptions: {
              smooth: true,
              animation: {
                speed: 1
              }
            },
            showMarker: true
          },
          animate: true,
          axes: {
            xaxis: {
              renderer: $.jqplot.CategoryAxisRenderer,
              label: '',
              labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
              tickRenderer: $.jqplot.CanvasAxisTickRenderer,
              tickOptions: {
              //  labelPosition: 'auto',
                angle: -60,
                textColor: '#222',
              }
            },
            yaxis: {
              label: '',
              min: 0,
              labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
              tickOptions: {
                textColor: '#222'
              }
            }
          },
          grid: {
            background: '#222', // 'rgba(0,0,0,1)', // 'rgba(57,57,57,1)',
            drawBorder: false,
            shadow: false,
            gridLineColor: '#555',
            gridLineWidth: 1
          }

  });

  // -------------------------------------------------------------------
      plot2 = $.jqplot ('chart2', [data2], {
              seriesColors: ['rgba(88, 205, 128, 1)'],
              title: {
                rendererOptions: {
                  text: '<strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Visites des 30 derniers jours</strong>',
                  fontSize: '24px',
                  textAlign: 'left',
                  textColor: '#222'
                }
              },
              seriesDefaults: {
                //renderer: $.jqplot.BarRenderer,
                pointLabels: {
                  show: true,
                  ypadding: 10,
                  xpadding: 0
                },
                rendererOptions: {
                  smooth: true,
                  animation: {
                    speed: 1
                  }
                },
                showMarker: true
              },
              animate: true,
              axes: {
                xaxis: {
                  renderer: $.jqplot.CategoryAxisRenderer,
                  label: '',
                  labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                  tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                  tickOptions: {
                    // labelPosition: 'auto',
                    angle: -60,
                    textColor: '#222',
                  }
                },
                yaxis: {
                  label: '',
                  min: 0,
                  labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                  tickOptions: {
                    textColor: '#222'
                  }
                }
              },
              grid: {
                background: '#222', // 'rgba(0,0,0,1)', // 'rgba(57,57,57,1)',
                drawBorder: false,
                shadow: false,
                gridLineColor: '#555',
                gridLineWidth: 1
              }

      });
      $(".jqplot-point-label").css("font-size", "1em").css("color", "white");

  // ---------------------------------------------------------------
  //var s1 = [['Chrome',8667], ['Firefox',2052], ['Edge',679], ['Safari',741]];

  plot3 = $.jqplot('chart3', [data3], {
    title: {
      rendererOptions: {
        text: '<strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Navigateurs</strong>',
        fontSize: '24px',
        textAlign: 'left',
        textColor: '#222'
      }
    },
    seriesColors:['#FF902b', '#73FF74', '#C7FF4C', '#AABDFF'],
    grid: {
        drawBorder: false,
        drawGridlines: false,
        background: '#ffffff',
        shadow:false
    },
    axesDefaults: {
    },
    seriesDefaults:{
        renderer:$.jqplot.PieRenderer,
        rendererOptions: {
            showDataLabels: true
        }
    },
    legend: {
    //  fontSize: '16px',
    //  location: 's',
      numberRows: 1,
      show: true
    }
  });

  // ---------------------------------------------------------
  //var s2 = [['Windows',7480], ['MacOS',2195], ['Linux',1812]];

  plot4 = $.jqplot('chart4', [data4], {
    title: {
      rendererOptions: {
        text: '<strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Plateformes</strong>',
        fontSize: '24px',
        textAlign: 'left',
        textColor: '#222'
      }
    },
    animate: true,
    seriesColors:['#FF902b', '#73FF74', '#C7FF4C'],
    grid: {
        drawBorder: false,
        drawGridlines: false,
        background: '#ffffff',
        shadow:false
    },
    axesDefaults: {
    },
    seriesDefaults:{
        renderer:$.jqplot.PieRenderer,
        rendererOptions: {
            showDataLabels: true
        }
    },
    legend: {
      fontSize: '16px',
    //  location: 's',
      numberRows: 1,
      show: true
    }
  });

  $("body").css("opacity", 1);

}); // ********************************************** fin ready
