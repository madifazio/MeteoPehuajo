$.get('/forecast',function(data){
  $(document).ready(function(){
    $('#graficos').text('');
    console.log(data);

    var temperatura = $.map(data.list,function(e){
      return [[e.fecha.diaSem + ' ' + e.fecha.dia + ' ' + e.fecha.hora, e.main.temp]];
      //return e.main.temp;
    });
    var lluvia = $.map(data.list,function(e){
      //return [[e.fecha.diaSem + ' ' + e.fecha.dia, e.main.temp]];
      return [
        [
          e.fecha.diaSem + ' ' + e.fecha.dia + ' ' + e.fecha.hora,
          e.rain == undefined || e.rain['3h'] == undefined ? 0 : e.rain['3h']
        ]
      ];
      //return e.rain == undefined || e.rain['3h'] == undefined ? 0 : e.rain['3h'];
    });
    console.log(temperatura);
    $.jqplot('graficos',  [temperatura, lluvia],{
      title: 'Temperatura y Lluvia',
      // Turns on animatino for all series in this plot.
      animate: true,
      // Will animate plot on calls to plot1.replot({resetAxes:true})
      animateReplot: true,
      cursor: {
          show: true,
          zoom: true,
          looseZoom: true,
          showTooltip: false
      },
      series:[
        {
          pointLabels: {
            show: true
          },
          xaxis:'xaxis',
          yaxis:'yaxis',
          rendererOptions: {
            // Speed up the animation a little bit.
            // This is a number of milliseconds.
            // Default for bar series is 3000.
            animation: {
                speed: 1500
            },
            highlightMouseOver: true
          }
        },
        {
          xaxis:'xaxis',
          yaxis:'y2axis',
          renderer:$.jqplot.BarRenderer
        }
      ],
      axes: {
        xaxis: {
          renderer: $.jqplot.CategoryAxisRenderer,
          label: 'Cada 3 horas',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          tickRenderer: $.jqplot.CanvasAxisTickRenderer,
          tickOptions: {
            angle: -90
          }
        },
        yaxis: {
          autoscale:true,
          label: '°C',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          tickRenderer: $.jqplot.CanvasAxisTickRenderer,
          tickOptions: {
            angle: 0,
            showGridline:false
          }
        },
        y2axis: {
          autoscale:true,
          label: 'mm',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          tickRenderer: $.jqplot.CanvasAxisTickRenderer,
          tickOptions: {
            angle: 0
          }
        }
      },
      highlighter: {
        show: true,
        showLabel: true,
        tooltipAxes: 'y',
        sizeAdjust: 7.5 ,
        tooltipLocation : 'ne'
      }
    });
  });
});
// cada un minuto actualizo las medidas.
setInterval(function(){
  $.get('/clima',function(err, data){
    if(err){
       console.log(err);
       return;
    }
    console.log(data);
  });
},10000);
