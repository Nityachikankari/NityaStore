public class Main {
    public static void main(String[] args) {
    	
    	int []values = {5,4,3,2,1};
    	int []labels = {1,1,2,2,3};
    	int numWanted = 3, useLimit = 1;
    	List<Item>items = new ArrayList<>();
    	for(int i =0;i<labels.length;i++) 
    		 items.add(new Item(values[i],labels[i]));
    	
    	PriorityQueue<Item>maxHeap = new PriorityQueue<Item>((Item a,Item b)->b.value-a.value);
    	maxHeap.addAll(items);
    	int value =0;
    	Map<Integer,Integer>map = new HashMap<Integer,Integer>();
    	while(!maxHeap.isEmpty() && numWanted>0){
    		Item cur = maxHeap.remove();
    		map.put(cur.label, map.getOrDefault(cur.label, 0)+1);
    		if(map.get(cur.label)<=useLimit) {
    			value+= cur.value;
    			numWanted-=1;
    		}
    			
    	}
    	System.out.println(value);
    	
}
    static class Item {
    	int value;
    	int label;
    public Item(int value, int label) {
    	this. value = value;
    	this.label = label;
    }
    }
}
