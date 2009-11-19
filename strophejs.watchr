#!/usr/bin/env watchr

begin; require 'watchr/event_handlers/em'; rescue LoadError; end
begin; require 'watchr/deps'; rescue LoadError; end

# p "reload"

watch( %r(.*), :modified, lambda { |md| File.directory? md[0] } ) do |md|
  File.directory? md[0] and raise Watchr::Refresh
end

watch( %r(strophejs.watchr), :modified ) do |md|
  # $stderr.print "?? #{md[0]}\n"
  raise Watchr::Refresh
end

map_to_test = lambda do |file, event|
  case file
  when %r(spec/(.*)([Ss]pec)\.js$)
    # Run JS spec's using parallel HTML file if it exists
    prefix = $~[1];
    prefix.sub! %r(_$), ""
    files = Dir[prefix+".*htm*"]
    if html = files.detect { |f| f =~ %r(\.x?html?) }
      event == :load ? nil : html
    else 
      file
    end
  else; file
  end
end

jazrb = lambda do |*args|
  files = []
  # boy, clean this up, but call/splat are subtle
  if Array === args[0]
    args = args[0][0]
    files = args.map { |pair| map_to_test.call( pair[0][0], pair[1] ) }
    files.compact!
    files.uniq!
  else
    (file, event) = *args
    file = map_to_test.call file, event
    if file
      files = [ file ]
    end
  end
  if !files.empty?
    deps = ""
    begin deps = "--deps #{db_path}"; rescue; end
    cmd = "jazrb -q #{deps} #{files.join(" ")}"
    puts cmd
    system cmd
    puts "exit status: #{$?.exitstatus}" if $?.exited? && $?.exitstatus != 0
    if  $?.signaled? && $?.termsig == 2
      Process.kill 2, 0
    end
  end
end

watch( %r(tests/.*.html$),  [ :load, :created, :modified ], nil, :batch => :html ) do |events|
  jazrb.call events
end

watch( %r(^vendor), [ nil, :load ], lambda { false } )

Signal.trap('QUIT') do
  EM.stop
end

# Local Variables:
# mode:ruby
# End:
